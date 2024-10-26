import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.POCKETBASE_URL);

export async function GET(req: Request) {
  const authorization = req.headers.get('authorization');
  if (!authorization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authorization.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    pb.authStore.save(token, null);
    await pb.collection('users').authRefresh();

    const user = pb.authStore.model;
    if (!user) throw new Error('Invalid token');

    const contentItems = await pb.collection('example_content').getFullList({
      filter: `account = "${user.id}"`,
      fields: 'id, title, description, created, updated',
    });

    return NextResponse.json(contentItems);
  } catch (error) {
    console.error('Error fetching content items:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  const { title, description } = await req.json();
  const authorization = req.headers.get('authorization');

  if (!authorization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const token = authorization.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    pb.authStore.save(token, null);
    await pb.collection('users').authRefresh();

    const user = pb.authStore.model;
    if (!user) throw new Error('Invalid token');

    const record = await pb.collection('example_content').create({
      title,
      description,
      account: user.id,
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error creating content item:', error);
    return NextResponse.json({ error: 'Failed to create content item' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const authorization = req.headers.get('authorization');
  const { id, title, description } = await req.json();

  if (!authorization || !id) {
    return NextResponse.json({ error: 'Unauthorized or missing content ID' }, { status: 401 });
  }

  const token = authorization.split(' ')[1];

  try {
    pb.authStore.save(token, null);
    await pb.collection('users').authRefresh();

    const user = pb.authStore.model;
    if (!user) throw new Error('Invalid token');
    const content = await pb.collection('example_content').getOne(id);

    if (content.account !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedContent = await pb.collection('example_content').update(id, { title, description });
    return NextResponse.json(updatedContent);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authorization = req.headers.get('authorization');
  const url = new URL(req.url);
  const contentId = url.searchParams.get('id');

  if (!authorization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const token = authorization.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!contentId) return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });

  try {
    pb.authStore.save(token, null);
    await pb.collection('users').authRefresh();

    const user = pb.authStore.model;
    if (!user) {
      throw new Error('Invalid token');
    }
    const contentItem = await pb.collection('example_content').getOne(contentId);

    if (contentItem.account !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await pb.collection('example_content').delete(contentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content item:', error);
    return NextResponse.json({ error: 'Failed to delete content item' }, { status: 500 });
  }
}
