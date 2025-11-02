import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

function authenticator(req:Response, res:Response, next:NextFunction) {
    const token=req.headers['authorization']?.split(' ')[1];
}