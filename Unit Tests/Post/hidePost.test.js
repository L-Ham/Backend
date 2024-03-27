const { hidePost } = require('../../controllers/postController');
const User = require('../../models/User');

describe('hidePost', () => {

        it('should hide a post successfully when it is not already hidden', async () => {
            const req = {
                userId: 'user123',
                body: {
                    postId: 'post123'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const user = {
                hidePosts: [],
                save: jest.fn()
            };

            User.findById = jest.fn().mockResolvedValue(user);

            await hidePost(req, res);

            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(user.hidePosts).toContain('post123');
            expect(user.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Post hidden successfully' });
        });

        it('should handle errors when finding user by ID', async () => {
            const req = {
                userId: 'user123',
                body: {
                    postId: 'post123'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            User.findById = jest.fn().mockRejectedValue(new Error('User not found'));

            await hidePost(req, res);

            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error hiding post' });
        });

        it('should not hide a post when it is already hidden', async () => {
            const req = {
                userId: 'user123',
                body: {
                    postId: 'post123'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const user = {
                hidePosts: ['post123'],
                save: jest.fn()
            };

            User.findById = jest.fn().mockResolvedValue(user);

            await hidePost(req, res);

            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(user.hidePosts).not.toContain('post123');
            expect(user.save).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Post is already hidden' });
        });

});
