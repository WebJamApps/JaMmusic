let mockDelay,
  mockError,
  mockResponse = {
    status: () => 200,
    ok: true,
    get: jest.fn(),
    toError: jest.fn(),
    body: {},
  };

const Request = {
  text: JSON.stringify(mockResponse),
  body: mockResponse,

  post: jest.fn().mockReturnThis({ set: () => {} }),
  get: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  query: jest.fn().mockReturnThis(),
  field: jest.fn().mockReturnThis(),
  type: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  accept: jest.fn().mockReturnThis(),
  timeout: jest.fn().mockReturnThis(),
  end: jest.fn().mockImplementation((callback) => {
    if (mockDelay) {
      this.delayTimer = setTimeout(callback, 0, mockError, mockResponse);
      return;
    }
    callback(mockError, mockResponse);
  }),
  then: jest.fn().mockImplementation((callback) => new Promise((resolve, reject) => {
    if (mockError) {
      return reject(callback(new Error(mockError)));
    }
    return resolve(callback(mockResponse));
  })),

  __setMockDelay: (boolValue) => {
    mockDelay = boolValue;
  },
  setMockResponse: (mockRes) => {
    mockResponse = mockRes;
  },
  setMockError: (mockErr) => {
    mockError = mockErr;
  },
  __setMockResponseBody: (body) => {
    mockResponse.body = body;
  },
};

export default Request;
