"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpResponse_1 = __importDefault(require("../../../handlers/httpResponse"));
const httpError_1 = __importDefault(require("../../../handlers/errorHandler/httpError"));
const async_1 = __importDefault(require("../../../handlers/async"));
const errors_1 = require("../../../utils/errors");
const user_model_1 = __importDefault(require("../../user/_shared/models/user.model"));
const Classification_1 = __importDefault(require("../../Classification/model/Classification"));
const Admin_1 = __importDefault(require("../model/Admin"));
exports.default = {
    getDashboardStats: (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const [totalUsers, totalClassifications, totalAdmins, recentUsers, recentClassifications] = yield Promise.all([
                user_model_1.default.countDocuments(),
                Classification_1.default.countDocuments(),
                Admin_1.default.countDocuments(),
                user_model_1.default.find().sort({ createdAt: -1 }).limit(5).select('-password'),
                Classification_1.default.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'email name')
            ]);
            const classificationsByCategory = yield Classification_1.default.aggregate([
                {
                    $group: {
                        _id: '$label',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]);
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const userRegistrationsByMonth = yield user_model_1.default.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sixMonthsAgo }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1 }
                }
            ]);
            const stats = {
                overview: {
                    totalUsers,
                    totalClassifications,
                    totalAdmins,
                    activeUsers: yield user_model_1.default.countDocuments({ 'accountConfimation.status': true })
                },
                recentActivity: {
                    recentUsers,
                    recentClassifications
                },
                analytics: {
                    classificationsByCategory,
                    userRegistrationsByMonth
                }
            };
            (0, httpResponse_1.default)(res, req, 200, 'Dashboard statistics retrieved successfully', stats);
        }
        catch (error) {
            if (error instanceof errors_1.CustomError) {
                (0, httpError_1.default)(next, error, req, error.statusCode);
            }
            else {
                (0, httpError_1.default)(next, error, req, 500);
            }
        }
    })),
    getAllUsers: (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const sortBy = req.query.sortBy || 'createdAt';
            const sortOrder = req.query.sortOrder || 'desc';
            const skip = (page - 1) * limit;
            const searchQuery = {};
            if (search) {
                searchQuery.$or = [
                    { email: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } }
                ];
            }
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
            const [users, totalUsers] = yield Promise.all([
                user_model_1.default.find(searchQuery)
                    .select('-password')
                    .sort(sort)
                    .skip(skip)
                    .limit(limit),
                user_model_1.default.countDocuments(searchQuery)
            ]);
            const usersWithStats = yield Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
                const classificationCount = yield Classification_1.default.countDocuments({ userId: user._id });
                return Object.assign(Object.assign({}, user.toObject()), { classificationCount });
            })));
            const pagination = {
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
                hasNext: page < Math.ceil(totalUsers / limit),
                hasPrev: page > 1
            };
            (0, httpResponse_1.default)(res, req, 200, 'Users retrieved successfully', {
                users: usersWithStats,
                pagination
            });
        }
        catch (error) {
            if (error instanceof errors_1.CustomError) {
                (0, httpError_1.default)(next, error, req, error.statusCode);
            }
            else {
                (0, httpError_1.default)(next, error, req, 500);
            }
        }
    })),
    getUserById: (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            const user = yield user_model_1.default.findById(userId).select('-password');
            if (!user) {
                throw new errors_1.CustomError('User not found', 404);
            }
            const classifications = yield Classification_1.default.find({ userId }).sort({ createdAt: -1 });
            const stats = {
                totalClassifications: classifications.length,
                classificationsByCategory: yield Classification_1.default.aggregate([
                    { $match: { userId: user._id } },
                    {
                        $group: {
                            _id: '$label',
                            count: { $sum: 1 }
                        }
                    }
                ])
            };
            (0, httpResponse_1.default)(res, req, 200, 'User details retrieved successfully', {
                user,
                classifications,
                stats
            });
        }
        catch (error) {
            if (error instanceof errors_1.CustomError) {
                (0, httpError_1.default)(next, error, req, error.statusCode);
            }
            else {
                (0, httpError_1.default)(next, error, req, 500);
            }
        }
    })),
    updateUserStatus: (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            const { isActive } = req.body;
            const user = yield user_model_1.default.findByIdAndUpdate(userId, { 'accountConfimation.status': isActive }, { new: true }).select('-password');
            if (!user) {
                throw new errors_1.CustomError('User not found', 404);
            }
            (0, httpResponse_1.default)(res, req, 200, 'User status updated successfully', user);
        }
        catch (error) {
            if (error instanceof errors_1.CustomError) {
                (0, httpError_1.default)(next, error, req, error.statusCode);
            }
            else {
                (0, httpError_1.default)(next, error, req, 500);
            }
        }
    })),
    deleteUser: (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            const user = yield user_model_1.default.findById(userId);
            if (!user) {
                throw new errors_1.CustomError('User not found', 404);
            }
            yield Classification_1.default.deleteMany({ userId });
            yield user_model_1.default.findByIdAndDelete(userId);
            (0, httpResponse_1.default)(res, req, 200, 'User deleted successfully', null);
        }
        catch (error) {
            if (error instanceof errors_1.CustomError) {
                (0, httpError_1.default)(next, error, req, error.statusCode);
            }
            else {
                (0, httpError_1.default)(next, error, req, 500);
            }
        }
    })),
    getAllClassifications: (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const category = req.query.category;
            const sortBy = req.query.sortBy || 'createdAt';
            const sortOrder = req.query.sortOrder || 'desc';
            const skip = (page - 1) * limit;
            const filterQuery = {};
            if (category) {
                filterQuery.label = category;
            }
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
            const [classifications, totalClassifications] = yield Promise.all([
                Classification_1.default.find(filterQuery)
                    .populate('userId', 'email name')
                    .sort(sort)
                    .skip(skip)
                    .limit(limit),
                Classification_1.default.countDocuments(filterQuery)
            ]);
            const pagination = {
                currentPage: page,
                totalPages: Math.ceil(totalClassifications / limit),
                totalClassifications,
                hasNext: page < Math.ceil(totalClassifications / limit),
                hasPrev: page > 1
            };
            (0, httpResponse_1.default)(res, req, 200, 'Classifications retrieved successfully', {
                classifications,
                pagination
            });
        }
        catch (error) {
            if (error instanceof errors_1.CustomError) {
                (0, httpError_1.default)(next, error, req, error.statusCode);
            }
            else {
                (0, httpError_1.default)(next, error, req, 500);
            }
        }
    })),
    deleteClassification: (0, async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { classificationId } = req.params;
            const classification = yield Classification_1.default.findByIdAndDelete(classificationId);
            if (!classification) {
                throw new errors_1.CustomError('Classification not found', 404);
            }
            (0, httpResponse_1.default)(res, req, 200, 'Classification deleted successfully', null);
        }
        catch (error) {
            if (error instanceof errors_1.CustomError) {
                (0, httpError_1.default)(next, error, req, error.statusCode);
            }
            else {
                (0, httpError_1.default)(next, error, req, 500);
            }
        }
    }))
};
//# sourceMappingURL=admin.dashboard.controller.js.map