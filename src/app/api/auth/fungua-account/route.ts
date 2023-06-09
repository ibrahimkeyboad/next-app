import { hash } from 'bcryptjs';
import User from '@/models/user';
import { NextResponse } from 'next/server';
import connetDB from '@/db';
import validator from 'validator';
import sendEmailVerification from '@/utils/sendEmail';

export async function POST(req: Request) {
  await connetDB();

  try {
    const body = await req.json();

    const { name, email, password }: bodyData = body;

    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid crendential' },
        { status: 422 }
      );
    }

    const exist = await User.findOne({ email: email.trim() });

    if (exist) {
      return NextResponse.json(
        { error: 'User already exist' },
        {
          status: 403,
        }
      );
    }

    const newPassword = await hash(password.trim(), 12);

    const user = await User.create({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      password: newPassword,
    });

    await sendEmailVerification(user);

    return NextResponse.json(
      {
        status: 'PENDING',
        msg: 'Verification Email sent',
      },
      { status: 201 }
    );
  } catch (error) {
    console.log('API error', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
