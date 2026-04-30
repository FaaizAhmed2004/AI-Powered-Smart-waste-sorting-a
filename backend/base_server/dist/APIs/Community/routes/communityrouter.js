"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const communitycontroller_1 = require("../controller/communitycontroller");
const communityvalidator_1 = require("../validator/communityvalidator");
const community_validator_1 = require("../validator/community.validator");
const authenticate_1 = __importDefault(require("../../../middlewares/authenticate"));
const async_1 = __importDefault(require("../../../handlers/async"));
const communityrouter = (0, express_1.Router)();
communityrouter.post('/', authenticate_1.default, async_1.default, (0, communityvalidator_1.validate)(community_validator_1.createPostSchema), communitycontroller_1.createPost);
communityrouter.get('/', communitycontroller_1.getAllPosts);
communityrouter.get('/:id', communitycontroller_1.getPostById);
communityrouter.post('/:id/like', authenticate_1.default, async_1.default, communitycontroller_1.toggleLike);
communityrouter.post('/:id/comment', authenticate_1.default, (0, communityvalidator_1.validate)(community_validator_1.commentSchema), (0, async_1.default)(communitycontroller_1.addComment));
communityrouter.delete('/:id', authenticate_1.default, (0, async_1.default)(communitycontroller_1.deletePost));
exports.default = communityrouter;
//# sourceMappingURL=communityrouter.js.map