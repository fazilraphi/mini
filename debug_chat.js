import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szudqgfjnyijukihmezv.supabase.co';
const supabaseAnonKey = 'sb_publishable_qqiHBhhl-s2fsTtmk8IfQg_iTzOjsuw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMessages() {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Chat Messages Sample:');
    data.forEach(m => {
        console.log(`ID: ${m.id}, BookingID: ${m.booking_id}, SenderID: ${m.sender_id}, Content: ${m.content}`);
    });
}

checkMessages();
