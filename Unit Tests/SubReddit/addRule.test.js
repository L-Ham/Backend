// const SubReddit = require("../../models/subreddit");
// const subredditController = require("../../controllers/subredditController");

// jest.mock("../../models/subreddit", () => ({
//   findById: jest.fn(),
// }));

// describe('addRuleWidget', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should add a rule widget to the subreddit', async () => {
//     const subredditId = 'subreddit123';
//     const ruleWidget = {
//       rule: 'Some rule',
//       description: 'Some description',
//       appliedTo: 'Some appliedTo',
//       reportReasonDefault: 'Some reportReasonDefault',
//     };

//     const subreddit = {
//       widgets: {
//         rulesWidgets: [],
//       },
//       save: jest.fn().mockResolvedValueOnce({}),
//     };

//     SubReddit.findById.mockResolvedValueOnce(subreddit);

//     const req = {
//       body: {
//         subredditId,
//         ...ruleWidget,
//       },
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     await subredditController.addRuleWidget(req, res);

//     expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
//     expect(subreddit.widgets.rulesWidgets).toHaveLength(1);
//     expect(subreddit.save).toHaveBeenCalled();
//     expect(res.json).toHaveBeenCalledWith({
//       message: "Rule added successfully",
//       savedSubreddit: {},
//     });
//   });

//   it('should handle error if subreddit is not found', async () => {
//     const subredditId = 'subreddit123';
//     const ruleWidget = {
//       rule: 'Some rule',
//       description: 'Some description',
//       appliedTo: 'Some appliedTo',
//       reportReasonDefault: 'Some reportReasonDefault',
//     };

//     SubReddit.findById.mockResolvedValueOnce(null);

//     const req = {
//       body: {
//         subredditId,
//         ...ruleWidget,
//       },
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     await subredditController.addRuleWidget(req, res);

//     expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
//   });

//   it('should handle server error', async () => {
//     const subredditId = 'subreddit123';
//     const ruleWidget = {
//       rule: 'Some rule',
//       description: 'Some description',
//       appliedTo: 'Some appliedTo',
//       reportReasonDefault: 'Some reportReasonDefault',
//     };
//     const errorMessage = 'Some error message';

//     SubReddit.findById.mockRejectedValueOnce(new Error(errorMessage));

//     const req = {
//       body: {
//         subredditId,
//         ...ruleWidget,
//       },
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     await subredditController.addRuleWidget(req, res);

//     expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({ message: "Error adding rule" });
//   });
// });