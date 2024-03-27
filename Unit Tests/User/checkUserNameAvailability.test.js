const userController = require("../../controllers/userController");
const User = require("../../models/user");

describe('checkUserNameAvailability', () => {

    // Function returns "Username available" message when given username is not taken
    it('should return "Username available" message when given username is not taken', async () => {
        const req = { query: { username: 'testUser' } };
        const res = { json: jest.fn() };
        const next = jest.fn();

        User.findOne = jest.fn().mockResolvedValue(null);

        await userController.checkUserNameAvailability(req, res, next);

        expect(User.findOne).toHaveBeenCalledWith({ userName: 'testUser' });
        expect(res.json).toHaveBeenCalledWith({ message: 'Username available' });
    });



    // Function logs "Checking username availability" message when called
    it('should log "Checking username availability" message when called', () => {
        const req = { query: { username: 'testUser' } };
        const res = { json: jest.fn() };
        const next = jest.fn();

        console.log = jest.fn();

        userController.checkUserNameAvailability(req, res, next);

        expect(console.log).toHaveBeenCalledWith('Checking username availability:', 'testUser');
    });
});
