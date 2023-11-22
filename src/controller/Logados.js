export class Logados {
    constructor() {
        this.list = [];
    }

    add(registro, token) {
        let user = { registro: registro, token: token }
        this.list.push(user);
    }

    islogged() {
        return this.list;
    }

    delete(token) {
        let ret;
        for (let i = 0; i < this.list.length; i++) {

            if (this.list[i].token == token) {

                ret = i;
                
                break;
            }

        }
        this.list.splice(ret, 1);
    }

    getLogar(registro) {

        let aux;
        let ret = -1;

        if (typeof registro === "number") {
            aux = (String(registro));
            for (let i = 0; i < this.list.length; i++) {

                if (this.list[i].registro == aux) {

                    ret = 1;
                }

            }

        } else {

            for (let i = 0; i < this.list.length; i++) {

                if (this.list[i].registro == registro) {

                    ret = 1;
                }

            }
        }

        return ret;
    }
    getDeslogar(token) {

        let aux;
        let ret = -1;

        if (typeof token === "number") {
            aux = (String(token));
            for (let i = 0; i < this.list.length; i++) {

                if (this.list[i].token == aux) {

                    ret = 1;
                }

            }

        } else {

            for (let i = 0; i < this.list.length; i++) {

                if (this.list[i].token == token) {

                    ret = 1;
                }

            }
        }

        return ret;
    }
}