import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, 'secret_key'); 
        req.userId = decoded.userId; 
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido.' });
    }
};