# Testing the Meals API

## Phase 1 Complete ✅

The `/api/meals` endpoint has been created with both POST and GET methods.

## API Endpoint

**Base URL:** `http://localhost:3000/api/meals`

## POST - Create a Meal

### Request Body:
```json
{
  "userId": "cmole9y3900003m1yhwllwsyp",
  "dishName": "Chicken Salad",
  "ingredients": ["chicken", "lettuce", "tomato", "olive oil"],
  "irritantTags": ["dairy-free", "gluten-free"],
  "source": "manual",
  "notes": "Lunch at home",
  "photoBase64": null
}
```

### Required Fields:
- `userId` (string)
- `dishName` (string)
- `ingredients` (array of strings, min 1)
- `source` (string: "barcode" | "search" | "manual")

### Optional Fields:
- `irritantTags` (array of strings)
- `notes` (string)
- `photoBase64` (string)

### Response (201 Created):
```json
{
  "id": "clxxx...",
  "userId": "cmole9y3900003m1yhwllwsyp",
  "timestamp": "2026-04-30T11:54:00.000Z",
  "source": "manual",
  "dishName": "Chicken Salad",
  "ingredients": "[\"chicken\",\"lettuce\",\"tomato\",\"olive oil\"]",
  "irritantTags": "[\"dairy-free\",\"gluten-free\"]",
  "notes": "Lunch at home",
  "photoBase64": null,
  "createdAt": "2026-04-30T11:54:00.000Z"
}
```

## GET - Fetch User's Meals

### Query Parameters:
- `userId` (required)

### Example:
```
GET http://localhost:3000/api/meals?userId=cmole9y3900003m1yhwllwsyp
```

### Response (200 OK):
```json
[
  {
    "id": "clxxx...",
    "userId": "cmole9y3900003m1yhwllwsyp",
    "timestamp": "2026-04-30T11:54:00.000Z",
    "source": "manual",
    "dishName": "Chicken Salad",
    "ingredients": ["chicken", "lettuce", "tomato", "olive oil"],
    "irritantTags": ["dairy-free", "gluten-free"],
    "notes": "Lunch at home",
    "photoBase64": null,
    "createdAt": "2026-04-30T11:54:00.000Z"
  }
]
```

Note: GET response automatically parses JSON fields for easier consumption.

## Testing with cURL

### Create a meal:
```bash
curl -X POST http://localhost:3000/api/meals \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "cmole9y3900003m1yhwllwsyp",
    "dishName": "Test Meal",
    "ingredients": ["rice", "beans"],
    "source": "manual"
  }'
```

### Fetch meals:
```bash
curl "http://localhost:3000/api/meals?userId=cmole9y3900003m1yhwllwsyp"
```

## Error Responses

### 400 Bad Request:
- Missing required fields
- Invalid source value
- Empty ingredients array

### 500 Internal Server Error:
- Database connection issues
- Unexpected errors

## Next Steps (Phase 2)

Now you can create the meal logging page (`app/meal/page.tsx`) that uses this API!