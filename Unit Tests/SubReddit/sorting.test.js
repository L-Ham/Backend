const subredditController = require("../../controllers/subredditController");
const SubReddit = require("../../models/subReddit");


describe('sorting', () => {

    // sorts subreddit posts by votes in descending order when Hot is true
    it('should sort subreddit posts by votes in descending order when Hot is true', async () => {
        const req = {
            params: {
                id: 'subredditId',
                Hot: true
            }
        };
        const res = {
            json: jest.fn(),
            status: jest.fn()
        };
        const next = jest.fn();

        SubReddit.findById = jest.fn().mockResolvedValue({
            posts: [
                { votes: 5 },
                { votes: 3 },
                { votes: 8 }
            ]
        });

        await subredditController.sorting(req, res, next);

        expect(SubReddit.findById).toHaveBeenCalledWith('subredditId');
        expect(res.json).toHaveBeenCalledWith([
            { votes: 8 },
            { votes: 5 },
            { votes: 3 }
        ]);
        expect(next).not.toHaveBeenCalled();
    });

    // The test checks that the 'res.json' function is not called when the subreddit has no posts.
    it('should not call res.json when subreddit has no posts', () => {
        const req = {
            params: {
                id: 'subredditId',
                Hot: true
            }
        };
        const res = {
            json: jest.fn(),
            status: jest.fn()
        };
        const next = jest.fn();

        SubReddit.findById = jest.fn().mockResolvedValue({
            posts: []
        });

        subredditController.sorting(req, res, next);

        expect(SubReddit.findById).toHaveBeenCalledWith('subredditId');
        expect(res.json).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    // sorts subreddit posts by creation time in descending order when New is true
    it('should sort subreddit posts by creation time in descending order when New is true', async () => {
        const req = {
            params: {
                id: 'subredditId',
                New: true
            }
        };
        const res = {
            json: jest.fn(),
            status: jest.fn()
        };
        const next = jest.fn();

        SubReddit.findById = jest.fn().mockResolvedValue({
            posts: [
                { createdAt: new Date("2022-01-01") },
                { createdAt: new Date("2022-01-03") },
                { createdAt: new Date("2022-01-02") }
            ]
        });

        await subredditController.sorting(req, res, next);

        expect(SubReddit.findById).toHaveBeenCalledWith('subredditId');
        expect(res.json).toHaveBeenCalledWith([
            { createdAt: new Date("2022-01-03") },
            { createdAt: new Date("2022-01-02") },
            { createdAt: new Date("2022-01-01") }
        ]);
        expect(next).not.toHaveBeenCalled();
    });

    // sorts subreddit posts by the sum of comments and votes in descending order when Top is true
    it('should sort subreddit posts by the sum of comments and votes in descending order when Top is true', async () => {
        const req = {
            params: {
                id: 'subredditId',
                Top: true
            }
        };
        const res = {
            json: jest.fn(),
            status: jest.fn()
        };
        const next = jest.fn();

        SubReddit.findById = jest.fn().mockResolvedValue({
            posts: [
                { comments: [], votes: 5 },
                { comments: [], votes: 3 },
                { comments: [], votes: 8 }
            ]
        });

        await subredditController.sorting(req, res, next);

        expect(SubReddit.findById).toHaveBeenCalledWith('subredditId');
        expect(res.json).toHaveBeenCalledWith([
            { comments: [], votes: 8 },
            { comments: [], votes: 5 },
            { comments: [], votes: 3 }
        ]);
        expect(next).not.toHaveBeenCalled();
    });

    // sorts subreddit posts randomly when Random is true
    it('should sort subreddit posts randomly when Random is true', async () => {
        const req = {
            params: {
                id: 'subredditId',
                Random: true
            }
        };
        const res = {
            json: jest.fn(),
            status: jest.fn()
        };
        const next = jest.fn();

        SubReddit.findById = jest.fn().mockResolvedValue({
            posts: [
                { votes: 5 },
                { votes: 3 },
                { votes: 8 }
            ]
        });

        await subredditController.sorting(req, res, next);

        expect(SubReddit.findById).toHaveBeenCalledWith('subredditId');
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    // returns a JSON response with the sorted posts
    it('should return a JSON response with the sorted posts when Hot is true', async () => {
        const req = {
            params: {
                id: 'subredditId',
                Hot: true
            }
        };
        const res = {
            json: jest.fn(),
            status: jest.fn()
        };
        const next = jest.fn();

        SubReddit.findById = jest.fn().mockResolvedValue({
            posts: [
                { votes: 5 },
                { votes: 3 },
                { votes: 8 }
            ]
        });

        await subredditController.sorting(req, res, next);

        expect(SubReddit.findById).toHaveBeenCalledWith('subredditId');
        expect(res.json).toHaveBeenCalledWith([
            { votes: 8 },
            { votes: 5 },
            { votes: 3 }
        ]);
        expect(next).not.toHaveBeenCalled();
    });




});
