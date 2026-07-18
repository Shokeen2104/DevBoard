const { requireAuth } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'testsecret';
  });

  it('should return 401 if no auth header exists', () => {
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided, authorization denied' });
  });

  it('should return 401 if token is invalid', () => {
    req.headers.authorization = 'Bearer invalidtoken';
    jwt.verify.mockImplementation(() => { throw new Error(); });

    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should call next and set req.user if token is valid', () => {
    req.headers.authorization = 'Bearer validtoken';
    const decoded = { id: 'userId123' };
    jwt.verify.mockReturnValue(decoded);

    requireAuth(req, res, next);
    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
  });
});
