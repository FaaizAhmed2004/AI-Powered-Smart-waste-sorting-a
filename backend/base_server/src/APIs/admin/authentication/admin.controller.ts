import { NextFunction, Request, Response } from 'express'
import httpResponse from '../../../handlers/httpResponse'
import httpError from '../../../handlers/errorHandler/httpError'
import { IAdminRegister, IAdminLogin, IAdminRegisterRequest, IAdminLoginRequest } from './types/admin.interface'
import { validateSchema } from '../../../utils/joi-validate'
import { adminRegisterSchema, adminLoginSchema } from './validation/admin.schema'
import { adminRegistrationService, adminLoginService } from './admin.service'
import { CustomError } from '../../../utils/errors'
import asyncHandler from '../../../handlers/async'
import health from '../../../utils/health'
import { EApplicationEnvironment } from '../../../constant/application'
import config from '../../../config/config'

export default {
    register: asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        try {
            const { body } = request as IAdminRegister

            // Payload validation
            const { error, payload } = validateSchema<IAdminRegisterRequest>(adminRegisterSchema, body)
            if (error) {
                return httpError(next, error, request, 422)
            }

            const registrationResult = await adminRegistrationService(payload)
            if (registrationResult.success === true) {
                // Set cookies
                const DOMAIN = health.getDomain()
                response
                    .cookie('adminAccessToken', registrationResult.data.accessToken, {
                        path: '/v1',
                        domain: DOMAIN,
                        sameSite: 'strict',
                        maxAge: 1000 * config.TOKENS.ACCESS.EXPIRY,
                        httpOnly: true,
                        secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
                    })
                    .cookie('adminRefreshToken', registrationResult.data.refreshToken, {
                        path: '/v1',
                        domain: DOMAIN,
                        sameSite: 'strict',
                        maxAge: 1000 * config.TOKENS.REFRESH.EXPIRY,
                        httpOnly: true,
                        secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
                    })

                httpResponse(response, request, 201, 'Admin registered successfully', registrationResult)
            }
        } catch (error) {
            if (error instanceof CustomError) {
                httpError(next, error, request, error.statusCode)
            } else {
                httpError(next, error, request, 500)
            }
        }
    }),

    login: asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        try {
            const { body } = request as IAdminLogin

            // Payload validation
            const { error, payload } = validateSchema<IAdminLoginRequest>(adminLoginSchema, body)
            if (error) {
                return httpError(next, error, request, 422)
            }

            const loginResult = await adminLoginService(payload)
            if (loginResult.success === true) {
                // Set cookies
                const DOMAIN = health.getDomain()
                response
                    .cookie('adminAccessToken', loginResult.data.accessToken, {
                        path: '/v1',
                        domain: DOMAIN,
                        sameSite: 'strict',
                        maxAge: 1000 * config.TOKENS.ACCESS.EXPIRY,
                        httpOnly: true,
                        secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
                    })
                    .cookie('adminRefreshToken', loginResult.data.refreshToken, {
                        path: '/v1',
                        domain: DOMAIN,
                        sameSite: 'strict',
                        maxAge: 1000 * config.TOKENS.REFRESH.EXPIRY,
                        httpOnly: true,
                        secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
                    })

                httpResponse(response, request, 200, 'Login successful', loginResult)
            }
        } catch (error) {
            if (error instanceof CustomError) {
                httpError(next, error, request, error.statusCode)
            } else {
                httpError(next, error, request, 500)
            }
        }
    }),

    logout: asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        try {
            const DOMAIN = health.getDomain()
            
            // Clear cookies
            response
                .clearCookie('adminAccessToken', {
                    path: '/v1',
                    domain: DOMAIN,
                    sameSite: 'strict',
                    maxAge: 1000 * config.TOKENS.ACCESS.EXPIRY,
                    httpOnly: true,
                    secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
                })
                .clearCookie('adminRefreshToken', {
                    path: '/v1',
                    domain: DOMAIN,
                    sameSite: 'strict',
                    maxAge: 1000 * config.TOKENS.REFRESH.EXPIRY,
                    httpOnly: true,
                    secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
                })

            httpResponse(response, request, 200, 'Logout successful', null)
        } catch (error) {
            httpError(next, error, request, 500)
        }
    })
}