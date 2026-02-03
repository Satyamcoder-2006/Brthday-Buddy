package expo.modules.media3transformer

import android.net.Uri
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.transformer.Composition
import androidx.media3.transformer.EditedMediaItem
import androidx.media3.transformer.ExportException
import androidx.media3.transformer.ExportResult
import androidx.media3.transformer.Transformer
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File

import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi

@OptIn(UnstableApi::class)
class Media3TransformerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Media3Transformer")

    AsyncFunction("composeVideo") { framePaths: List<String>, outputUri: String, frameDurationMs: Long, promise: Promise ->
      val context = appContext.reactContext ?: run {
        promise.reject("ERR_CTX", "React Context is null", null)
        return@AsyncFunction
      }

      try {
        val sequences = mutableListOf<EditedMediaItem>()
        
        // 1. Create MediaItems for each frame
        framePaths.forEach { path ->
          // Handle 'file://' prefix if present
          val cleanPath = if (path.startsWith("file://")) path.substring(7) else path
          val uri = Uri.fromFile(File(cleanPath))
          
          val mediaItem = MediaItem.Builder()
            .setUri(uri)
            .setImageDurationMs(frameDurationMs) 
            .build()
            
          sequences.add(EditedMediaItem.Builder(mediaItem).build())
        }

        // 2. Build Composition
        // Wrap the list of edited media items into a Sequence
        val sequence = androidx.media3.transformer.EditedMediaItemSequence(sequences)
        val composition = Composition.Builder(sequence).build()

        // 3. Configure Transformer
        // Convert outputUri (file://...) to absolute path for Transformer
        val outputCleanPath = if (outputUri.startsWith("file://")) outputUri.substring(7) else outputUri
        // Ensure output file doesn't exist? Transformer overwrites usually or fails.
        // Let's rely on standard behavior or delete if exists.
        val outFile = File(outputCleanPath)
        if (outFile.exists()) {
             outFile.delete()
        }

        val transformer = Transformer.Builder(context)
          .setVideoMimeType(MimeTypes.VIDEO_H264)
          .addListener(object : Transformer.Listener {
            override fun onCompleted(composition: Composition, exportResult: ExportResult) {
               promise.resolve(outputUri)
            }

            override fun onError(composition: Composition, exportResult: ExportResult, exportException: ExportException) {
               promise.reject("ERR_TRANSFORM", "Video generation failed: ${exportException.message}", exportException)
            }
          })
          .build()

        // 4. Start
        transformer.start(composition, outputCleanPath)

      } catch (e: Exception) {
        promise.reject("ERR_MEDIA3", "Failed to initialize transformer: ${e.message}", e)
      }
    }
  }
}
