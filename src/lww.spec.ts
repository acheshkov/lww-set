import test from 'ava';
import {LWWSet} from './lww';


test("create set", (t) => {
    t.notThrows(() => {
        new LWWSet<number>();
    })
});

test("delete not existing", (t) => {
    let set = new LWWSet<number>();
    t.notThrows(() => {
        set.remove(5);
    })
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