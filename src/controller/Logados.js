export class Logados {
    constructor() {
        this.list = [];
    }

    add(registro) {
        this.list.push(registro);
    }

    islogged() {
        return this.list;
    }

    delete(registro) {
        var index = this.list.indexOf(registro);
        this.list.splice(index, 1);
    }

    get(registro) {
        
        var index = this.list.includes(parseInt(registro));
        return index;
    }
}