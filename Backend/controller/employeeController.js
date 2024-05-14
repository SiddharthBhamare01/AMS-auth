import employee from "../models/employeeModel.js";
import bcrypt from "bcryptjs";
import {nanoid, customAlphabet} from "nanoid";
import jwt from 'jsonwebtoken';

export const getAllEmployees = async (req, res) => {
    try {
        const employees = await employee.find({});
        return res.json(employees);
    }
    catch(error) {
        console.log("cannot find employees");
        return res.status(500).json({ message: error.message });

    }
}

export const registerEmployee = async (req, res) => {
    try {
        const { employeeFullName, employeeEmail ,employeePhoneNo,employeeAadhar, employeePassword } = req.body;
        
        const existingemployee = await employee.findOne({ $or: [{ employeeAadhar },{employeePhoneNo}, { employeeEmail }] });

        if (existingemployee) {
            return res.status(404).json("employee already exists")
        } else {
            bcrypt.genSalt(10,(err,salt)=>{
                bcrypt.hash(employeePassword,salt,async(err,hashedPassword)=>{
                    console.log(hashedPassword);
                    const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPRQSTUVWXYZ', 10)
                    const autoGenertedEmployeeId=nanoid(5);
                    const newemployee={
                        employeeFullName,
                        employeeId:"E00" + autoGenertedEmployeeId,
                        employeeEmail,
                        employeePhoneNo,
                        employeeAadhar,
                        employeePassword:hashedPassword,
                        employeeAvatar:""
                    };

                    await employee.create(newemployee);
                    return res.json(newemployee);
                  
                })

            })
          
        }
    } catch (error) {
        return res.status(500).json("Internal server error")
    }
};


export const loginEmployee = async (req, res) => {
    try {
        const { employeeEmail, employeePassword } = req.body;
        const employeeFound = await employee.findOne({ employeeEmail });

        if (!employeeFound) {
            return res.status(404).json({ error: "employee not found" });
            
        }
        else{
        bcrypt.compare(employeePassword, employeeFound.employeePassword, (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Internal server error" });
            }
           else if (result) {
               
                const token = jwt.sign({ employeeEmail: employeeFound.employeeEmail }, 'my-secret', { expiresIn: '24h' }); 
                return res.status(200).json({ token });

            } else {
                return res.status(401).json({ error: "Incorrect password" });
            }
        });
    }
    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};