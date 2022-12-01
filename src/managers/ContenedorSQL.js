const knex = require('knex');

class ContenedorSQL {
    constructor(options,tableName){
        this.database = knex(options);
        this.table = tableName;
    }

    async getAll(){
        try {
            const response = await this.database.from(this.table).select("*");
            return response;
        } catch (error) {
            return `Hubo un error: ${error}`;
        }
    }
    async save(object){
        try {
            const response = await this.database.from(this.table).insert(object);
            console.log("Response saving", response);
        } catch (error) {
            return `Hubo un error: ${error}`;
        }
    }

}

module.exports = {ContenedorSQL};