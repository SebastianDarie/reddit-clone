"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
const validateRegister = (credentials) => {
    if (!/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(credentials.email)) {
        return [
            {
                field: 'email',
                message: 'invalid email',
            },
        ];
    }
    if (credentials.username.length <= 2) {
        return [
            {
                field: 'username',
                message: 'length must be longer than 2',
            },
        ];
    }
    if (credentials.username.includes('@')) {
        return [
            {
                field: 'username',
                message: 'cannot include an @',
            },
        ];
    }
    if (credentials.password.length <= 2) {
        return [
            {
                field: 'password',
                message: 'length must be longer than 2',
            },
        ];
    }
    return null;
};
exports.validateRegister = validateRegister;
//# sourceMappingURL=validateRegister.js.map