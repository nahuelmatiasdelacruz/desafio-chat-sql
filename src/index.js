// Constantes
const fs = require("fs");
const express = require("express");
const {Server} = require("socket.io");
const app = express();
const handlebars = require("express-handlebars");
const path = require("path");
const viewsFolder = path.join(__dirname, "views");
const PORT = 8081;
const {ContenedorSQL} = require("./managers/ContenedorSQL");
const {options} = require("./config/databaseConfig");
const server = app.listen(PORT,()=>{
    console.log("Server on");
});
const io = new Server(server);

// Sets
app.set("views",viewsFolder);
app.set("view engine","handlebars");
app.engine("handlebars",handlebars.engine());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(__dirname+"/public"));

// Peticiones
app.get("/",(req,res)=>{
    res.render("home");
});
app.post("/productos",async (req,res)=>{
    const result = await addProduct(req.body);
    res.redirect("/")
});

// Instancias de contenedores
const productosApi = new ContenedorSQL(options.mariaDB,"productos");
const mensajesApi = new ContenedorSQL(options.sqliteDB,"chat");

//WebSocket
io.on("connection",async (socket)=>{
    // Enviamos mensajes y productos al cliente
    const messages = await mensajesApi.getAll();
    socket.emit("messages",messages)
    const products = await productosApi.getAll();
    socket.emit("products",products);  
    
    socket.on("newMessage",async (data)=>{
        const result = await addMessage(data);
        const newMessages = await mensajesApi.getAll();
        if(result.success){
            io.sockets.emit("messages",newMessages);
        }
    });
    socket.on("newProduct",async (data)=>{
        const result = await addProduct(data);
        const products = await productosApi.getAll();
        if(result.success){
            io.sockets.emit("products",products);
        }
    });
})

// Funciones
const addMessage = async (data)=> {
    try{
        const response = await mensajesApi.save(data);
        return {success: "Se ha agregado el mensaje"}
    }catch(e){
        console.log("Error agregando el mensaje a la db" + e);
        return null;
    }
}
const addProduct = async (data) =>{
    try{
        const response = await productosApi.save(data);
        return {success: "Se ha agregado el producto"}
    }catch(e){
        console.log("Error agregando el producto" + e);
    }
}