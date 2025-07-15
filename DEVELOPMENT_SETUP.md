# Development Setup for Strategy Risk Control

## Issue Analysis

The reported issues are caused by running the application in a production environment where mock APIs are not available. The strategy freeze feature uses mock API endpoints that are only configured for development mode.

## Issues Identified

1. **404 Error for `/strategy-freeze/options`**: This occurs because the user is accessing `https://test.hodlmall.com/strategy-freeze/options` which is a production environment where mock APIs are not available.

2. **Empty Symbol and Strategy Name fields after save**: This could be related to the production environment not having the proper API endpoints.

## Solution

### Option 1: Run in Development Mode (Recommended)

To test the strategy freeze feature with mock APIs:

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Run in development mode**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Open http://localhost:9528 (or the port shown in the terminal)
   - Navigate to Strategy Center → Risk Control
   - The mock APIs will be available at URLs like:
     - `http://localhost:9528/dev-api/strategy-freeze/options`
     - `http://localhost:9528/dev-api/strategy-freeze`

### Option 2: Implement Real Backend APIs

If you need this to work in production, you'll need to implement the following backend API endpoints:

#### Required API Endpoints

1. **GET /strategy-freeze/options**
   ```json
   {
     "code": 200,
     "data": {
       "symbols": [
         {"label": "BTCUSDT", "value": "BTCUSDT"},
         {"label": "ETHUSDT", "value": "ETHUSDT"}
       ],
       "strategies": [
         {"label": "MA_CROSS", "value": "MA_CROSS"},
         {"label": "RSI_DIVERGENCE", "value": "RSI_DIVERGENCE"}
       ],
       "tradeTypes": [
         {"label": "实盘", "value": "real"},
         {"label": "测试", "value": "test"}
       ]
     }
   }
   ```

2. **GET /strategy-freeze** - List configurations
3. **POST /strategy-freeze** - Create/update configuration
4. **PUT /strategy-freeze/:id** - Update specific configuration
5. **DELETE /strategy-freeze/:id** - Delete configuration
6. **POST /strategy-freeze/unfreeze** - Manual unfreeze
7. **POST /strategy-freeze/reset-loss** - Reset loss count
8. **GET /strategy-freeze/logs** - Operation logs
9. **POST /strategy-freeze/simulate-trade** - Simulate trade

### Option 3: Enable Mock API in Production (Not Recommended)

If you absolutely need to run mock APIs in production (not recommended for security reasons):

1. **Modify `vue.config.js`** to include mock server in production:
   ```javascript
   // In vue.config.js, modify the devServer configuration
   before: process.env.NODE_ENV === 'production' ? require('./mock/mock-server.js') : require('./mock/mock-server.js')
   ```

2. **Update environment variables** to use mock API base URL in production.

## Debugging

The mock API now includes debug logging. If you run in development mode, you'll see console logs showing:
- PUT requests to update configurations
- Configuration data before and after updates
- GET requests to fetch configurations
- Returned configuration data

## Current Mock API Improvements

The following improvements have been made to the mock API:

1. **Fixed URL pattern matching**: Changed from `/strategy-freeze/\\d+` to `/strategy-freeze/([0-9]+)` for better regex matching
2. **Added debug logging**: Console logs help track API requests and responses
3. **Improved error handling**: Better error messages for troubleshooting

## Testing the Fix

To verify the fix works:

1. Run `npm run dev` to start development server
2. Navigate to Strategy Center → Risk Control
3. Try to edit and save a configuration
4. Check browser console for debug logs
5. Verify that symbol and strategy name fields are preserved after save

## Next Steps

1. **For immediate testing**: Use development mode with mock APIs
2. **For production deployment**: Implement real backend API endpoints
3. **For debugging**: Check browser console logs when using development mode