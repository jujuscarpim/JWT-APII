const {DataTypes}=require('sequelize'); const db=require('../config/db');
module.exports=db.define('Category',{name:{type:DataTypes.STRING,unique:true,allowNull:false},description:{type:DataTypes.TEXT}});
