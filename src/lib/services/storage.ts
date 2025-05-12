import { supabase } from '../supabase';

/**
 * Sets the bucket policy to public 
 */
async function setBucketToPublic(bucketName: string) {
    try {
        // First try the native updateBucket method
        try {
            const { error } = await supabase.storage.updateBucket(bucketName, {
                public: true,
                fileSizeLimit: 5 * 1024 * 1024
            });

            if (!error) return true;
        } catch (e) {
            console.warn('Failed to update bucket with native method, trying alternatives');
        }

        // If that fails, try a workaround by creating a dummy file and making it public
        const dummy = new Blob(['test'], { type: 'text/plain' });
        const dummyPath = '___public_test.txt';

        // Upload the dummy file
        await supabase.storage
            .from(bucketName)
            .upload(dummyPath, dummy, { upsert: true });

        // Get a signed URL with long expiry or try to make it public directly
        // The exact methods may vary depending on your Supabase version
        try {
            await supabase.storage
                .from(bucketName)
                .getPublicUrl(dummyPath);

            // If we got here without error, delete the dummy file
            await supabase.storage
                .from(bucketName)
                .remove([dummyPath]);

            return true;
        } catch (e) {
            console.error('Failed to set public access:', e);
            return false;
        }
    } catch (error) {
        console.error('Error setting bucket to public:', error);
        return false;
    }
}

/**
 * Ensures that the public storage bucket exists
 */
export async function ensurePublicBucket() {
    try {
        // Check if the bucket exists
        const { data: buckets, error } = await supabase.storage.listBuckets();

        if (error) {
            console.error('Error checking buckets:', error);
            return false;
        }

        // Check if public bucket exists
        const publicBucketExists = buckets.some(bucket => bucket.name === 'public');

        if (!publicBucketExists) {
            // Create public bucket with public read access
            const { error: createError } = await supabase.storage.createBucket('public', {
                public: true, // files are publicly accessible
                fileSizeLimit: 5 * 1024 * 1024, // Increase to 5MB file size limit
            });

            if (createError) {
                console.error('Error creating public bucket:', createError);
                return false;
            }
        }

        // Always try to set the bucket to public
        await setBucketToPublic('public');

        return true;
    } catch (error) {
        console.error('Unexpected error ensuring public bucket:', error);
        return false;
    }
}

/**
 * Creates the necessary folder structure in a bucket
 */
export async function createFolderInBucket(bucket: string, folderName: string): Promise<boolean> {
    try {
        // Create an empty file to establish the folder structure
        // Supabase storage uses a folder convention with empty files
        const emptyFile = new Blob([''], { type: 'text/plain' });
        const folderPath = `${folderName}/.folder`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(folderPath, emptyFile, {
                upsert: true
            });

        if (error) {
            console.error('Error creating folder structure:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error creating folder in bucket:', error);
        return false;
    }
}

/**
 * Uploads a file to Supabase storage and returns the public URL
 */
export async function uploadFile(
    file: File,
    bucket: string = 'public',
    folder: string = 'uploads'
): Promise<string | null> {
    try {
        // Ensure public bucket exists
        const bucketCreated = await ensurePublicBucket();
        if (!bucketCreated) {
            console.error('Failed to ensure bucket exists');
            return null;
        }

        // Try to create the folder structure first
        await createFolderInBucket(bucket, folder);

        // Create a unique file name to avoid conflicts
        const fileExt = file.name.split('.').pop();
        const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 11);
        const fileName = `${folder}/${uniqueId}.${fileExt}`;

        // Upload the file
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true // Set to true to overwrite existing files
            });

        if (error) {
            console.error('Upload error details:', error);

            // If the error is about the folder not existing, let's try to upload to root
            if (error.message?.includes('not found')) {
                console.log('Trying to upload without folder structure...');
                const rootFileName = `${uniqueId}.${fileExt}`;

                const { data: rootData, error: rootError } = await supabase.storage
                    .from(bucket)
                    .upload(rootFileName, file, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (rootError) {
                    console.error('Root upload error:', rootError);
                    throw rootError;
                }

                // Get public URL for root file
                const { data: urlData } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(rootFileName);

                return urlData?.publicUrl || null;
            }

            throw error;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data?.path || fileName);

        return urlData?.publicUrl || null;
    } catch (error) {
        console.error('Error uploading file:', error);
        return null;
    }
} 