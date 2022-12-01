const {options} = require("../config/databaseConfig");
const knex = require("knex");

const databaseMariadb = knex(options.mariaDB);

const databaseSqlite = knex(options.sqliteDB);

const createTables = async () => {
    try {
        let messagesTable = await databaseMariadb.schema.hasTable("productos");
        if(messagesTable){
            await databaseMariadb.schema.dropTable("productos");
        }
        await databaseMariadb.schema.createTable("productos",table=>{
            table.increments("id");
            table.string("title",20).nullable(false);
            table.integer("price").nullable(false);
            table.string("thumbnail",200).nullable(false);
        });
        let chatTable = await databaseSqlite.schema.hasTable("chat"); 
        if(chatTable){
            await databaseSqlite.schema.dropTable("chat");
        }else{
            await databaseSqlite.schema.createTable("chat",table=>{
                table.increments("id");
                table.string("email",40);
                table.string("date",20);
                table.string("message",200);
            });
        }
    } catch (error) {
        console.log(error);
    }
    databaseMariadb.destroy();
    databaseSqlite.destroy();
}

createTables();