import { NextRequest } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { cleanupImages } from '@/lib/image-lifecycle';
import { successResponse, errorResponse, handleAuthError } from '@/lib/api-utils';

// Endpoint administrativo; lotes acotados, sin cron ni servicios adicionales.
export async function POST(request: NextRequest) {
  try {
    verifyAdmin(request);
    await connectDB();
    return successResponse(await cleanupImages(20));
  } catch (error) {
    return handleAuthError(error) || errorResponse('No se pudo completar la limpieza; se conserva para reintento', 500);
  }
}
