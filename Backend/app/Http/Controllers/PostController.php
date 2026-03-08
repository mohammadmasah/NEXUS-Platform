<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/createPost",
     *     summary="Create a post",
     *     tags={"Posts"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"content"},
     *                 @OA\Property(property="content", type="string", example="Hello world!"),
     *                 @OA\Property(property="image", type="string", format="binary")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Post created"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function createPost(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:280',
            'image' => 'nullable|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('posts', 'public');
        }

        $post = Post::create([
            'user_id' => $request->user()->id,
            'content' => $request->content,
            'image' => $imagePath
        ]);

        return response()->json([
            "message" => "Post created",
            "post" => $post
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/getAllPosts",
     *     summary="Get all posts",
     *     tags={"Posts"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="List of all posts")
     * )
     */
    public function getAllPosts()
    {
        $posts = Post::with(['user', 'comments.user'])->latest()->get();
        return response()->json($posts);
    }

    /**
     * @OA\Get(
     *     path="/api/getUserPosts",
     *     summary="Get posts of the authenticated user",
     *     tags={"Posts"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="List of user posts")
     * )
     */
    public function getUserPosts(Request $request)
    {
        $posts = Post::with(['user', 'comments.user'])->where('user_id', $request->user()->id)->latest()->get();
        return response()->json($posts);
    }

    /**
     * @OA\Put(
     *     path="/api/editPost/{id}",
     *     summary="Edit a post",
     *     tags={"Posts"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"content"},
     *             @OA\Property(property="content", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Post updated"),
     *     @OA\Response(response=403, description="Unauthorized"),
     *     @OA\Response(response=404, description="Post not found")
     * )
     */
    public function editPost(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        $this->authorize('update', $post);
        $request->validate(['content' => 'required|max:280']);
        $request->validate(['image' => 'nullable|max:2048']);
        $post->fill($request->only(['content', 'image']));
        $post->save();
        return response()->json($post);
    }

    /**
     * @OA\Delete(
     *     path="/api/deletePost/{id}",
     *     summary="Delete a post and its comments",
     *     tags={"Posts"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Post deleted"),
     *     @OA\Response(response=403, description="Unauthorized"),
     *     @OA\Response(response=404, description="Post not found")
     * )
     */
    public function deletePost($id)
    {
        $post = Post::findOrFail($id);

        if ($post->user_id !== auth()->id()) {
            return response()->json(['message' => ''], 403);
        }

        $post->comments()->delete();
        $post->delete();

        return response()->json(['message' => 'Post et ses commentaires supprimés avec succès']);
    }
}
