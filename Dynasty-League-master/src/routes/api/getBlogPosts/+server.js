import { supabase } from '$lib/supabaseClient';
import { json, error } from '@sveltejs/kit';

export async function GET() {
    // Fetch posts from Supabase ordered by date
    const { data, error: dbError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (dbError) {
        console.error(dbError);
        throw error(500, "Problem retrieving blog posts from Supabase");
    }

    // Map Supabase structure to the format your components expect
    const formattedData = {
        items: data.map(post => ({
            sys: { 
                id: post.id, 
                createdAt: post.created_at 
            },
            fields: {
                title: post.title,
                content: post.content,
                type: 'Post',
                video_url: post.video_url,
                author: post.team_name // This uses the team name associated with the post
            }
        }))
    };

    return json(formattedData);
}