var express = require("express");
var Zombie = require("./models/zombie");
var Arma = require("./models/arma");

var passport = require("passport");
var acl = require('express-acl');
var router = express.Router();

acl.config({
    baseUrl:"/",
    defaultRole:'invitado',
    decodedObjectName:'zombie',
    roleSearchPath:'zombie.role'
})


router.use((req,res,next)=>{
    res.locals.currentZombie = req.zombie;
    res.locals.errors=req.flash("error");
    res.locals.infos = req.flash("info");
    if(req.isAuthenticated()){
        req.session.role = req.zombie.role;
    }
    console.log(req.session);
    next();
});
router.use(acl.authorize);

router.get("/",(req,res,next)=>{
    Zombie.find()
    .sort({createAt:"descending"})
    .exec((err,zombies)=>{
        if(err){
            return next (err);
        }
        res.render("index",{zombies:zombies});
    });
});

router.get("/login",(req,res) =>{
    res.render("login");
});

router.post("/login",passport.authenticate("login",{
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));

router.get("/logout",(req, res) =>{
    req.logout();
    res.redirect("/");
});


router.get("/armas",(req,res,next)=>{
    Arma.find()
    .sort({createdAt: "descending"})
    .exec((err,armas)=>{
        if(err){
            return next (err);
        }
        res.render("armas",{armas:armas});
    });
});

router.get("/armas",(req,res)=>{
    res.render("armas");

});
router.get("/add",(req,res)=>{
    res.render("add");

});

//////////////////
router.get("/singup",(req,res)=>{
    res.render("singup");
});
router.get("/edit",(req,res)=>{
    res.render("edit");
});

router.post("/edit",ensureAuthenticated,(req,res,next)=>{
    req.zombie.displayName=req.body.displayName;
    req.zombie.bio=req.body.bio;
    req.zombie.save((err)=>{
        if(err){
            next(err);
            return;
        }
        req.flash("info","Perfil actualizado!");
        res.redirect("/edit");
    });
});

router.post("/singup",(req,res,next)=>{
    var username = req.body.username;
    var password = req.body.password;
    var role = req.body.role;

    Zombie.findOne({username:username}, function(err,zombie){
        if(err){
            return next(err);
        }
        if(zombie){
            req.flash("error","El nombre de usuario ya lo ha tomado otro zombie");
            return res.redirect("/singup");
        }
        var newZombie = new Zombie({
            username:username,
            password:password,
            role:role
        });
        newZombie.save(next);
        return res.redirect("/");
    });
});

router.post("/add",(req,res,next)=>{
    var descripcion = req.body.descripcion;
    var categoria = req.body.categoria;
    var fuerza = req.body.fuerza;
    var municiones = req.body.municiones;
        var newArma = new Arma({
            descripcion:descripcion,
            categoria:categoria,
            fuerza:fuerza,
            municiones
        });
        newArma.save(next);
        return res.redirect("/armas");
    
});

function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash("info","Necesitas iniciar sesion..");
        res.redirect("/login");
    }
}


module.exports = router;