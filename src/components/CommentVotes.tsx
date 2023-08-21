'use client'

import useCustomeToast from '@/hooks/use-custom-toast'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { CommentVoteRequest } from '@/lib/validators/vote'
import { usePrevious } from '@mantine/hooks'
import { CommentVote, VoteType } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import { FC, useState } from 'react'
import { Button } from './ui/Button'

type PartialVote = Pick<CommentVote, 'type'>

interface CommentVotesProps {
    commentId: string,
    initialVotesAmt: number,
    initialVote?: PartialVote
}

const CommentVotes: FC<CommentVotesProps> = ({
    commentId,
    initialVotesAmt,
    initialVote,
}) => {
    const { loginToast } = useCustomeToast()
    const [voteAmt, setVoteAmt] = useState<number>(initialVotesAmt)
    const [currentVote, setCurrentVote] = useState(initialVote)
    const prevVote = usePrevious(currentVote)

    const { mutate: vote } = useMutation({
        mutationFn: async (voteType: VoteType) => {
            const payload: CommentVoteRequest = {
                commentId,
                voteType
            }

            await axios.patch('/api/subreddit/post/comment/vote', payload)
        },
        onError: (err, voteType) => {
            if (voteType === 'UP') {
                setVoteAmt((prev) => prev - 1)
            } else setVoteAmt((prev) => prev + 1)

            //reset current vote
            setCurrentVote(prevVote)

            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast()
                }
            }

            return toast({
                title: 'Something went wrong',
                description: 'Your vote was not registerd, please try again later.',
                variant: 'destructive'
            })
        },
        onMutate: (type) => {
            if (currentVote?.type === type) {
                setCurrentVote(undefined)

                if (type === 'UP') setVoteAmt((prev) => prev - 1)
                else if (type === 'DOWN') setVoteAmt((prev) => prev + 1)
            } else {
                setCurrentVote({ type })
                if(type === 'UP') setVoteAmt((prev) => prev + (currentVote ? 2 : 1))
                else if (type === 'DOWN') setVoteAmt((prev) => prev - (currentVote ? 2 : 1))
            }
        }
    })

    return (
        <div className="flex gap-1">
            <Button onClick={() => vote('UP')} size='sm' variant='ghost' aria-label='upvote'>
                <ArrowBigUp className={cn('h-5 w-5 text-zinc-700', {
                    'text-emerald-500 fill-emerald-500': currentVote?.type === 'UP',
                })}/>
            </Button>

            <p className='text-center font-medium py-2 text-sm text-zinc-900'>
                {voteAmt}
            </p>

            <Button onClick={() => vote('DOWN')} size='sm' variant='ghost' aria-label='upvote'>
                <ArrowBigDown className={cn('h-5 w-5 text-zinc-700', {
                    'text-red-500 fill-red-500': currentVote?.type === 'DOWN',
                })}/>
            </Button>
        </div>
    )
}

export default CommentVotes