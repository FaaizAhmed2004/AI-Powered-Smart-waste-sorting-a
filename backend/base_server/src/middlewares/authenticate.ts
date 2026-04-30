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
            const cookieToken = cookies?.accessToken
            if (cookieToken) {
                accessToken = cookieToken
            }
        }

        if (accessToken) {
            const { userId } = jwt.verifyToken(accessToken, config.TOKENS.ACCESS.SECRET) as IDecryptedJwt

            const user = await query.findUserById(userId)
            if (user) {
                req.authenticatedUser = user
                // Also set req.user for compatibility with classification controller
                // Cast user to any to access _id property from Mongoose document
                req.user = { _id: (user as any)._id?.toString() }
                return next()
            }
        }
        httpError(next, new Error(responseMessage.UNAUTHORIZED), request, 401)
    } catch (error) {
        httpError(next, error, request, 500)
    }
})
