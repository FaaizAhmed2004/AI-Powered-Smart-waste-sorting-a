import { Request } from 'express'

export interface IAdminRegisterRequest {
    email: string
    password: string
    firstName?: string
    lastName?: string
    role?: 'super_admin' | 'admin'
    permissions?: string[]
}

export interface IAdminLoginRequest {
    email: string
    password: string
}

export interface IAdminRegister extends Request {
    body: IAdminRegisterRequest
}

export interface IAdminLogin extends Request {
    body: IAdminLoginRequest
}

export interface IAuthenticatedAdmin {
    _id: string
    email: string
    firstName?: string
    lastName?: string
    role: 'super_admin' | 'admin'
    permissions: string[]
    isActive: boolean
}

export interface IAdminAuthResponse {
    success: boolean
    message: string
    data: {
        admin: IAuthenticatedAdmin
        accessToken: string
        refreshToken: string
    }
}