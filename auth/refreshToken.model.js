const {DataTypes}=require('sequelize');const db=require('../config/db');
module.exports=db.define('RefreshToken',{
 token:{type:DataTypes.TEXT,allowNull:false},expiresAt:{type:DataTypes.DATE,allowNull:false},revoked:{type:DataTypes.BOOLEAN,defaultValue:false}
});
