<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/post/{id}/comment",
     *     summary="Add a comment to a post",
     *     tags={"Comments"},
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
     *             @OA\Property(property="content", type="string", example="Great post!")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Comment added"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function createComment($id, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:280',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $comment = Comment::create([
            'user_id' => auth()->id(),
            'post_id' => $id,
            'content' => $request->content,
        ]);

        return response()->json([
            'message' => 'Commentaire ajouté',
            'comment' => $comment->load('user')
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/post/{id}/getComments",
     *     summary="Get all comments for a post",
     *     tags={"Comments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="List of comments")
     * )
     */
    public function getAllComments(Post $post)
    {
        $comments = Comment::where('post_id', $post->id)->with('user')->get();
        return response()->json($comments);
    }

    /**
     * @OA\Put(
     *     path="/api/post/{post_id}/editComment/{comment_id}",
     *     summary="Edit a comment",
     *     tags={"Comments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="post_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="comment_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"content"},
     *             @OA\Property(property="content", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Comment updated"),
     *     @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function editComment(Request $request, Post $post, Comment $comment)
    {
        $this->authorize('edit', $comment);
        $request->validate(['content' => 'required|string|max:280']);
        $comment->fill($request->only(['content']));
        $comment->save();
        return response()->json(['message' => 'commentaire modifié', $comment]);
    }

    /**
     * @OA\Delete(
     *     path="/api/post/{post_id}/deleteComment/{comment_id}",
     *     summary="Delete a comment",
     *     tags={"Comments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="post_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="comment_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Comment deleted"),
     *     @OA\Response(response=403, description="Unauthorized"),
     *     @OA\Response(response=404, description="Comment not found")
     * )
     */
    public function deleteComment($post_id, $comment_id)
    {
        $comment = Comment::find($comment_id);
        if (!$comment) {
            return response()->json(['message' => 'Commentaire non trouvé'], 404);
        }
        if ($comment->user_id !== auth()->id()) {
            return response()->json(['message' => ''], 403);
        }
        $comment->delete();
        return response()->json(['message' => 'Commentaire supprimé avec succès']);
    }
}
