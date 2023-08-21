import { formatTimeToNow } from '@/lib/utils'
import { Post, User, Vote } from '@prisma/client'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { FC, useRef } from 'react'
import EditorOutput from './EditorOutput'
import PostVoteClient from './post-vote/PostVoteClient'

type PartialVote = Pick<Vote, 'type'>

interface PostProps {
    subredditName: string
    post: Post & {
        author: User,
        votes: Vote[]
    },
    commentAmt: number
    votesAmt: number
    currentVote?: PartialVote
}

const Post: FC<PostProps> = ({ subredditName, post, commentAmt, votesAmt, currentVote }) => {
    const pRef = useRef<HTMLDivElement>(null)  

    return (
        <div className="rounded-md bg-white shadow">
            <div className="px-6 py-4 flex justify-between">
                {/* todo: post votes */}
                <PostVoteClient postId={post.id} initialVote={currentVote?.type} initialVoteAmt={votesAmt}/>

                <div className="w-0 flex-1">
                    <div className="max-h-40 mt-2 text-xs text-gray-500">
                        {subredditName ? (
                            <>
                                <a className='hover:underline font-semibold text-zinc-900 hover:underline-offset-2' href={`/r/${subredditName}`}>r/{subredditName}</a>
                                <span className='px-1'>.</span>
                            </>
                        ) : (
                            null
                        )}
                        <span>Posted by</span>{' '}
                        <a href={`/u/${post.authorId}`} className='cursor-pointer hover:underline hover:underline-offset-2'>
                            <span>u/{post.author.username}</span>{' '}
                        </a>
                        {formatTimeToNow(new Date(post.createdAt))}
                    </div>

                    <a href={`/r/${subredditName}/post/${post.id}`}>
                        <h1 className='text-lg font-medium py-2 leading-6 text-gray-900'>
                            {post.title}
                        </h1>
                    </a>

                    <div className="relative text-sm max-h-40 overflow-clip w-full" ref={pRef}>
                        <EditorOutput content={post.content} />

                        {pRef.current?.clientHeight === 160 ? (
                            <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent"/>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 z-20 text-sm px-4 py-4 sm:px-6">
                <a href={`/r/${subredditName}/post/${post.id}`} className='w-fit flex items-center gap-2'>
                    <MessageSquare className='h-4 w-4'/> {commentAmt} comments
                </a>
            </div>
        </div>
    )
}

export default Post