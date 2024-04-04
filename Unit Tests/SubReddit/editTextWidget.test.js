// const SubReddit = require("../../models/subreddit");
// const subredditController = require("../../controllers/subredditController");

// jest.mock("../../models/subreddit", () => ({
//   findById: jest.fn(),
// }));

// describe('editTextWidget', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should edit a text widget in the subreddit', async () => {
//     const subredditId = 'subreddit123';
//     const textWidgetId = 'textWidget123';
//     const widgetName = 'Updated Widget 1';
//     const text = 'This is an updated text widget';

//     const subreddit = {
//       widgets: {
//         textWidgets: [
//           {
//             _id: textWidgetId,
//             widgetName: 'Widget 1',
//             text: 'This is a text widget',
//           },
//         ],
//       },
//       save: jest.fn().mockResolvedValueOnce({}),
//     };

//     SubReddit.findById.mockResolvedValueOnce(subreddit);

//     const req = {
//       body: {
//         subredditId,
//         textWidgetId,
//         widgetName,
//         text,
//       },
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     await subredditController.editTextWidget(req, res);

//     expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
//     expect(subreddit.widgets.textWidgets[0].widgetName).toBe(widgetName);
//     expect(subreddit.widgets.textWidgets[0].text).toBe(text);
//     expect(subreddit.save).toHaveBeenCalled();
//     expect(res.json).toHaveBeenCalledWith({
//       message: "Text widget edited successfully",
//       savedSubreddit: {},
//     });
//   });

//   it('should handle error if subreddit is not found', async () => {
//     const subredditId = 'subreddit123';
//     const textWidgetId = 'textWidget123';
//     const widgetName = 'Updated Widget 1';
//     const text = 'This is an updated text widget';

//     SubReddit.findById.mockResolvedValueOnce(null);

//     const req = {
//       body: {
//         subredditId,
//         textWidgetId,
//         widgetName,
//         text,
//       },
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     await subredditController.editTextWidget(req, res);

//     expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
//   });

//   it('should handle error if text widget ID is not provided', async () => {
//     const subredditId = 'subreddit123';
//     const widgetName = 'Updated Widget 1';
//     const text = 'This is an updated text widget';

//     const req = {
//       body: {
//         subredditId,
//         widgetName,
//         text,
//       },
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     await subredditController.editTextWidget(req, res);

//     expect(SubReddit.findById).not.toHaveBeenCalled();
//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ message: "Text widget ID is required" });
//   });

//   it('should handle error if no text widgets are found', async () => {
//     const subredditId = 'subreddit123';
//     const textWidgetId = 'textWidget123';
//     const widgetName = 'Updated Widget 1';
//     const text = 'This is an updated text widget';

//     const subreddit = {
//       widgets: {},
//     };

//     SubReddit.findById.mockResolvedValueOnce(subreddit);

//     const req = {
//       body: {
//         subredditId,
//         textWidgetId,
//         widgetName,
//         text,
//       },
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     await subredditController.editTextWidget(req, res);

//     expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ message: "No text widgets found" });
//   });


//   it('should handle server error', async () => {
//     const subredditId = 'subreddit123';
//     const textWidgetId = 'textWidget123';
//     const widgetName = 'Updated Widget 1';
//     const text = 'This is an updated text widget';
//     const errorMessage = 'Some error message';

//     SubReddit.findById.mockRejectedValueOnce(new Error(errorMessage));

//     const req = {
//       body: {
//         subredditId,
//         textWidgetId,
//         widgetName,
//         text,
//       },
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     await subredditController.editTextWidget(req, res);

//     expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({ message: "Error editing text widget" });
//   });

//   it('should handle error if text widget ID is not found', async () => {
//     const subredditId = 'subreddit123';
//     const textWidgetId = 'textWidget123';
//     const widgetName = 'Updated Widget 1';
//     const text = 'This is an updated text widget';

//     const subreddit = {
//       widgets: {
//         textWidgets: [
//           {
//             _id: 'anotherTextWidgetId',
//             widgetName: 'Widget 2',
//             text: 'This is another text widget',
//           },
//         ],
//       },
//       save: jest.fn().mockResolvedValueOnce({}),
//     };

//     SubReddit.findById.mockResolvedValueOnce(subreddit);

//     const req = {
//       body: {
//         subredditId,
//         textWidgetId,
//         widgetName,
//         text,
//       },
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     await subredditController.editTextWidget(req, res);

//     expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ message: "Text widget not found" });
//   });












  
// });