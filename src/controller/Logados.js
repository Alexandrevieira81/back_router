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

        let index;
      
        if(typeof registro === "number") {
            index = this.list.includes(String(registro));
            console.log("Caiu no número");
        }else{

            index = this.list.includes(registro);
            console.log("Caiu na String");
        }              
       
        
        return index;
    }
}