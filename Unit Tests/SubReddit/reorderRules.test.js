// const SubReddit = require("../../models/subreddit");
// const subredditController = require("../../controllers/subredditController");

// jest.mock("../../models/subreddit", () => ({
//   findById: jest.fn(),
// }));

// describe('reorderRules', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should reorder rules successfully', async () => {
//     const subredditId = 'subreddit123';
//     const rulesOrder = ['rule1', 'rule2', 'rule3'];

//     const subreddit = {
//       widgets: {
//         rulesWidgets: [
//           { _id: 'rule1' },
//           { _id: 'rule2' },
//           { _id: 'rule3' },
//         ],
//       },
//       save: jest.fn().mockResolvedValueOnce({}),
//     };

//     SubReddit.findById.mockResolvedValueOnce(subreddit);

//     const req = {
//       body: {
//         subredditId,
//         rulesOrder,
//       },
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     await subredditController.reorderRules(req, res);

//     expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
//     expect(subreddit.widgets.rulesWidgets).toEqual([
//       { _id: 'rule1' },
//       { _id: 'rule2' },
//       { _id: 'rule3' },
//     ]);
//     expect(subreddit.save).toHaveBeenCalled();
//     expect(res.json).toHaveBeenCalledWith({
//       message: "Rules reordered successfully",
//       savedSubreddit: {},
//     });
//   });

//   it('should handle error if subreddit is not found', async () => {
//     const subredditId = 'subreddit123';
//     const rulesOrder = ['rule1', 'rule2', 'rule3'];

//     SubReddit.findById.mockResolvedValueOnce(null);

//     const req = {
//       body: {
//         subredditId,
//         rulesOrder,
//       },
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     await subredditController.reorderRules(req, res);

//     expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
//   });

//   it('should handle error if no rule widgets found', async () => {
//     const subredditId = 'subreddit123';
//     const rulesOrder = ['rule1', 'rule2', 'rule3'];

//     const subreddit = {
//       widgets: {},
//     };

//     SubReddit.findById.mockResolvedValueOnce(subreddit);

//     const req = {
//       body: {
//         subredditId,
//         rulesOrder,
//       },
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     await subredditController.reorderRules(req, res);

//     expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ message: "No rule widgets found" });
//   });

//   it('should handle server error', async () => {
//     const subredditId = 'subreddit123';
//     const rulesOrder = ['rule1', 'rule2', 'rule3'];
//     const errorMessage = 'Some error message';

//     SubReddit.findById.mockRejectedValueOnce(new Error(errorMessage));

//     const req = {
//       body: {
//         subredditId,
//         rulesOrder,
//       },
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     await subredditController.reorderRules(req, res);

//     expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({ message: "Error reordering rules" });
//   });
// });