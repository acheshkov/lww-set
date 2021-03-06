import test from 'ava';
import {LWWSet} from './lww';


test("create set", (t) => {
    t.notThrows(() => {
        new LWWSet<number>();
    });
});

test("delete on empty set", (t) => {
    let set = new LWWSet<number>();
    t.notThrows(() => {
        set.remove(5);
    });
});

test("lookup on empty set", (t) => {
    let set = new LWWSet<number>();
    t.notThrows(() => {
        t.false(set.lookup(10));
    });
});

test("insert-lookup", (t) => {
    let set = new LWWSet<number>();
    set.insert(2);
    t.true(set.lookup(2));
});

test("insert-delete-lookup", (t) => {
    let set = new LWWSet<number>();
    set.insert(2);
    set.remove(2);
    t.false(set.lookup(2));
});


test("insert-delete-insert-lookup", (t) => {
    let set = new LWWSet<number>();
    set.insert(2, 101);
    set.remove(2, 102);
    set.insert(2, 103);
    t.true(set.lookup(2));
});

test("insert-delete-insert-lookup-unsync", (t) => {
    let set = new LWWSet<number>();
    set.insert(2, 101);
    set.insert(2, 103);
    set.remove(2, 102);
    t.true(set.lookup(2));
});

test("insert-delete-commutative-by-timestamp", (t) => {
    let set_1 = new LWWSet<number>();
    let set_2 = new LWWSet<number>();
    set_1.insert(2, 101);
    set_1.remove(2, 102);

    set_2.remove(2, 102);
    set_2.insert(2, 101);
    
    t.true(set_1.lookup(2) == set_2.lookup(2));
});

test("insert-delete-insert-lookup-biased-add", (t) => {
    let set = new LWWSet<number>('add');
    set.insert(2, 101);
    set.remove(2, 102);
    set.insert(2, 102);
    t.true(set.lookup(2));
});

test("insert-delete-insert-lookup-biased-del", (t) => {
    let set = new LWWSet<number>('del');
    set.insert(2, 101);
    set.remove(2, 102);
    set.insert(2, 102);
    t.false(set.lookup(2));
});

test("merge empty sets", (t) => {
    let set_1 = new LWWSet<number>();
    let set_2 = new LWWSet<number>();
    t.notThrows(() => {
        set_1.merge(set_2);
    });
});

test("merge not intersected", (t) => {
    let set_1 = new LWWSet<number>();
    let set_2 = new LWWSet<number>();
    let ins_1 = [1,2,3];
    let ins_2 = [4,5,6];
    ins_1.forEach(v => set_1.insert(v))
    ins_2.forEach(v => set_2.insert(v))
    
    let set_3 = set_1.merge(set_2);

    [...ins_1, ...ins_2].forEach(v => {
        t.true(set_3.lookup(v));
    });
});

test("merge intersected", (t) => {
    let set_1 = new LWWSet<number>();
    let set_2 = new LWWSet<number>();
    let ins_1 = [1,2,3];
    let ins_2 = [3,4,5];

    ins_1.forEach(v => set_1.insert(v))
    ins_2.forEach(v => set_2.insert(v))
    

    let set_3 = set_1.merge(set_2);

    [...ins_1, ...ins_2].forEach(v => {
        t.true(set_3.lookup(v));
    });
});

test("merge with deletion", (t) => {
    let set_1 = new LWWSet<number>();
    let set_2 = new LWWSet<number>();
    let ins_1 = [1,2,3];
    let ins_2 = [3,4,5];
    let del_1 = [1];
    let del_2 = [4];

    ins_1.forEach(v => set_1.insert(v))
    ins_2.forEach(v => set_2.insert(v))
    del_1.forEach(v => set_1.remove(v))
    del_2.forEach(v => set_2.remove(v))
    

    let set_3 = set_1.merge(set_2);

    [...del_1, ...del_2].forEach(v => {
        t.false(set_3.lookup(v));
    });
});


test("set to list has correct type", (t) => {
    let set = new LWWSet<number>();
    t.true(set.to_list() instanceof Array);
});

test("empty set produces empty list", (t) => {
    let set = new LWWSet<number>();
    t.true(set.to_list().length === 0)
});


test("to_list returns all inserted elements ", (t) => {
    let to_insert = [1,2,3,4,5];
    let set = new LWWSet<number>();
    to_insert.forEach(v => set.insert(v));
    t.deepEqual(to_insert.sort(), set.to_list().sort())
});

test("to_list do not return deleted elements", (t) => {
    let to_insert = [1,2,3,4,5];
    let to_delete = [4, 1];
    let set = new LWWSet<number>();

    to_insert.forEach(v => set.insert(v, 100));
    to_delete.forEach(v => set.remove(v, 101));

    let lookup_deleted = to_delete.filter(v => set.to_list().indexOf(v) >= 0)
    
    // there are no deleted elements 
    t.true(lookup_deleted.length === 0)
    
});


