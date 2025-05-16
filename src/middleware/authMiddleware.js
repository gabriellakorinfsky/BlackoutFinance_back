import jwt from 'jsonwebtoken';

// Middleware de autenticação
export const authenticate = (req, res, next) => {
    // Tenta recuperar o token do cabeçalho "Authorization" (formato: "Bearer <token>")
    const token = req.headers['authorization']?.split(' ')[1];

    // Se não houver token, retorna erro 403 (acesso proibido)
    if (!token) {
        return res.status(403).json({ message: 'Token não fornecido' });
    }

    try {
        // Verifica e decodifica o token com a chave secreta usada na geração
        const decoded = jwt.verify(token, 'secret_key'); 

        // Adiciona o ID do usuário decodificado ao objeto da requisição,
        // permitindo que as rotas seguintes saibam quem é o usuário autenticado
        req.userId = decoded.userId; 

        // Passa para o próximo middleware ou rota
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido.' });
    }
};