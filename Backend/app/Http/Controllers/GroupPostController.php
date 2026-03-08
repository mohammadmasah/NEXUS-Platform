<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GroupPostController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/group/{group_id}/post",
     *     summary="Create a post in a group",
     *     tags={"Group Posts"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="group_id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"content", "group_id"},
     *                 @OA\Property(property="content", type="string", example="Hello group!"),
     *                 @OA\Property(property="group_id", type="integer", example=1),
     *                 @OA\Property(property="image", type="string", format="binary")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Post created"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:255',
            'image' => 'nullable|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('group_posts', 'public');
        }

        $groupPost = GroupPost::create([
            'user_id' => $request->user()->id,
            'group_id' => $request->group_id,
            'content' => $request->content,
            'image' => $imagePath
        ]);

        return response()->json([
            'message' => 'Post created',
            'post' => $groupPost
        ]);
    }
}
