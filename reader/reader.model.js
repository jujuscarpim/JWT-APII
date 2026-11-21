const {DataTypes}=require('sequelize'); const db=require('../config/db');
module.exports=db.define('Reader',{name:{type:DataTypes.STRING,allowNull:false},cpf:{type:DataTypes.STRING,allowNull:false,unique:true},email:DataTypes.STRING,phone:DataTypes.STRING});
