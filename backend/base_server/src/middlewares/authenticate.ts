import { NextFunction, Request, Response } from 'express'
import { IAuthenticateRequest, IDecryptedJwt } from '../types/types'
import jwt from '../utils/jwt'
import config from '../config/config'
import query from '../APIs/user/_shared/repo/user.repository'
import httpError from '../handlers/errorHandler/httpError'
import responseMessage from '../constant/responseMessage'
import asyncHandler from '../handlers/async'

export default asyncHandler(async (request: Request, _response: Response, next: NextFunction) => {
    try {
        const req = request as unknown as IAuthenticateRequest

        const { cookies, headers } = req

        // Try to get token from Authorization header first, then from cookies
        let accessToken = headers.authorization?.replace('Bearer ', '')
        
        if (!accessToken) {
            const cookieToken = typeof cookies?.accessToken === 'string' ? cookies.accessToken : undefined
            if (cookieToken) {
                accessToken = cookieToken
            }
        }

        if (accessToken) {
            try {
                const { userId } = jwt.verifyToken(accessToken, config.TOKENS.ACCESS.SECRET) as IDecryptedJwt

                const user = await query.findUserById(userId)
                if (user) {
                    req.authenticatedUser = user
                    // Also set req.user for compatibility with classification controller
                    req.user = { _id: userId, id: userId }
                    return next()
                }
            } catch (tokenError: unknown) {
                // Handle specific JWT errors
                if (tokenError instanceof Error) {
                    if (tokenError.name === 'TokenExpiredError') {
                        httpError(next, new Error('Access token expired'), request, 401)
                        return
                    } else if (tokenError.name === 'JsonWebTokenError') {
                        httpError(next, new Error('Invalid access token'), request, 401)
                        return
                    } else {
                        // Re-throw other errors
                        throw tokenError
                    }
                } else {
                    throw tokenError
                }
            }
        }
        httpError(next, new Error(responseMessage.UNAUTHORIZED), request, 401)
    } catch (error) {
        httpError(next, error, request, 500)
    }
})
