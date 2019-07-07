export class PriorityQueue {
    parent = (i: number) => ((i + 1) >>> 1) - 1;
    left = (i: number) => (i << 1) + 1;
    right = (i: number) => (i + 1) << 1;
    _heap: any[];
    _comparator: (a: any, b: any) => boolean;
    constructor(comparator = (a: any, b: any) => a > b) {
        this._heap = [];
        this._comparator = comparator;
    }
    size() {
        return this._heap.length;
    }
    isEmpty() {
        return this.size() == 0;
    }
    peek() {
        return this._heap[0];
    }
    push(...values: any[]) {
        values.forEach(value => {
            this._heap.push(value);
            this._siftUp();
        });
        return this.size();
    }
    pop() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > 0) {
            this._swap(0, bottom);
        }
        this._heap.pop();
        this._siftDown();
        return poppedValue;
    }
    replace(value: any) {
        const replacedValue = this.peek();
        this._heap[0] = value;
        this._siftDown();
        return replacedValue;
    }
    _greater(i: number, j: number) {
        return this._comparator(this._heap[i], this._heap[j]);
    }
    _swap(i: number, j: number) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }
    _siftUp() {
        let node = this.size() - 1;
        while (node > 0 && this._greater(node, this.parent(node))) {
            this._swap(node, this.parent(node));
            node = this.parent(node);
        }
    }
    _siftDown() {
        let node = 0;
        while (
            (this.left(node) < this.size() && this._greater(this.left(node), node)) ||
            (this.right(node) < this.size() && this._greater(this.right(node), node))
        ) {
            let maxChild =
                this.right(node) < this.size() && this._greater(this.right(node), this.left(node))
                    ? this.right(node)
                    : this.left(node);
            this._swap(node, maxChild);
            node = maxChild;
        }
    }
}
