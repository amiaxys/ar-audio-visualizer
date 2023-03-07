import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { User } from "./user.js";

export const Visualization = sequelize.define("Visualization", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  audio: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  visual: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});

Visualization.belongsTo(User);
User.hasMany(Visualization);
