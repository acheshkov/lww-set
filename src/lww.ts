
export type Biased = 'del' | 'add';

export class LWWSet<T> {
    public A = new Map<T, number>();
    public R = new Map<T, number>();

    constructor(private biased: Biased = 'del') {}

    /**
     * Remove elenent O(1)
     * @param e element to remove
     * @param ts operation timestamp. by default it's now()
     */
    remove(e: T, ts = new Date().getTime()): void {
        let ts_current = this.R.get(e) || -Infinity;
        this.R.set(e, Math.max(ts, ts_current));
    }
    
    /**
     * Insert element O(1)
     * @param e element to insert
     * @param ts operation timestamp. by default it's now()
     */
    insert(e: T, ts = new Date().getTime()): void {
        let ts_current = this.A.get(e) || -Infinity;
        this.A.set(e, Math.max(ts, ts_current));
    }
    
    /**
     * Lookup element O(1)
     * @param e element to lookup 
     */
    lookup(e: T): boolean {
        let ts_add = this.A.get(e);
        if (!ts_add) return false;
        let ts_del = this.R.get(e) || -Infinity;
        if (ts_add === ts_del && this.biased === 'add') return true;
        if (ts_add === ts_del && this.biased === 'del') return false; 
        return ts_del < ts_add;

    }
    
    /**
     * Union of two sets. O(n + m)
     * @param set 
     */
    merge(set: LWWSet<T>): LWWSet<T>{
        let new_set = new LWWSet<T>();

        [...this.A.entries(), ...set.A.entries()].forEach(v => {
            new_set.insert(v[0], v[1]);
        });

        [...this.R.entries(), ...set.R.entries()].forEach(v => {
            new_set.remove(v[0], v[1]);
        });

        return new_set;
    }

}
