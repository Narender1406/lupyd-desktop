package com.lupyd.app

import android.app.Application
import android.util.Log
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.cio.*
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.response.respond
import io.ktor.server.response.respondBytes
import io.ktor.server.response.respondFile
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.head
import io.ktor.server.routing.put
import io.ktor.server.routing.routing
import io.ktor.utils.io.copyTo
import io.ktor.utils.io.jvm.javaio.copyTo
import java.io.File
import java.io.FileOutputStream
import java.nio.file.Files

data class ContentRange(val start: Long, val end: Long) {
    companion object {
        fun parse(h: String?, size: Long): ContentRange? {
            if (h == null || !h.startsWith("bytes=")) return null
            val parts = h.removePrefix("bytes=").split("-")
            val s = parts[0].toLongOrNull() ?: 0
            val e = parts.getOrNull(1)?.toLongOrNull() ?: (size - 1)
            if (s > e || e >= size) return null
            return ContentRange(s, e)
        }
    }
}


class FileServer(val port: Int = 51414, val rootDir: File) {
    private val TAG = "FileServer"

    val server = embeddedServer(CIO, port = port) {

        install(CORS) {
            allowOrigins { true }
            allowMethod(HttpMethod.Get)
            allowMethod(HttpMethod.Put)
            allowMethod(HttpMethod.Head)
            allowMethod(HttpMethod.Options)
            allowHeader(HttpHeaders.ContentType)
            allowHeader(HttpHeaders.ContentLength)
            allowHeader(HttpHeaders.Range)
        }

        routing {


            head("/{...}") {
                val rel = call.parameters.getAll("...")?.joinToString("/") ?: ""
                Log.d(TAG, "HEAD request for: $rel")
                val file = File(rootDir, rel).canonicalFile

                if (file.exists()) {
                    call.respond(HttpStatusCode.OK) {
                        headers {
                            append(
                                HttpHeaders.ContentLength,
                                file.length().toString()
                            )
                        }
                    }
                } else {
                    call.respond(HttpStatusCode.NotFound)
                }
            }

            get("/{...}") { 
                val rel = call.parameters.getAll("...")?.joinToString("/") ?: ""
                Log.d(TAG, "GET request for: $rel")
                val file = File(rootDir, rel).canonicalFile

                if (!file.exists() || !file.startsWith(rootDir)) {
                    Log.d(TAG, "File not found or outside rootDir: ${file.path}")
                    call.respond(HttpStatusCode.NotFound)
                    return@get
                }

                Log.d(TAG, "File found: ${file.path}")

                // Handle Range requests automatically
                val rangeHeader = call.request.headers[HttpHeaders.Range]

                if (rangeHeader != null) {
                    val range = ContentRange.parse(rangeHeader, file.length())
                    if (range == null) {
                        Log.d(TAG, "Requested range not satisfiable: $rangeHeader")
                        call.respond(HttpStatusCode.RequestedRangeNotSatisfiable)
                        return@get
                    }

                    Log.d(TAG, "Serving partial content for range: $range")
                    val bytes = file.inputStream().use { input ->
                        input.skip(range.start)
                        val buffer = ByteArray((range.end - range.start + 1).toInt())
                        val bytesRead = input.read(buffer)
                        if (bytesRead < buffer.size) {
                            buffer.sliceArray(0 until bytesRead)
                        } else {
                            buffer
                        }
                    }

                    call.respondBytes(
                        bytes,
                        ContentType.defaultForFile(file),
                        HttpStatusCode.PartialContent
                    ) {
                        headers {
                            append(
                                HttpHeaders.ContentRange,
                                "bytes ${range.start}-${range.start + bytes.size - 1}/${file.length()}"
                            )
                        }
                    }
                } else {
                    Log.d(TAG, "Responding with full file")
                    call.respondFile(file)
                }
            }

            put("/{...}") {
                val rel = call.parameters.getAll("...")?.joinToString("/") ?: ""
                Log.d(TAG, "PUT request for: $rel")
                val file = File(rootDir, rel).canonicalFile
//                val contentLength = call.request.headers[HttpHeaders.ContentLength]?.toLong()
//
//                if (contentLength == null) {
//                    Log.d(TAG, "Bad request, Content-Length header is missing")
//                    call.respond(HttpStatusCode.BadRequest)
//                    return@put
//                }

                Log.d(TAG, "Saving file: ${file.path}")
                val stream = FileOutputStream(file, false)

                call.request.receiveChannel().copyTo(stream)

                stream.flush()
                stream.close()

                Log.d(TAG, "File saved successfully: ${file.path}")
                call.respond(HttpStatusCode.OK)
            }

            delete("/{...}") {
                val rel = call.parameters.getAll("...")?.joinToString("/") ?: ""
                Log.d(TAG, "DELETE request for: $rel")
                val file = File(rootDir, rel).canonicalFile
                file.delete()
                call.respond(HttpStatusCode.OK)
            }
        }

    }


    fun startServer() {
        server.start(wait = true)
    }

    fun closeServer() {
        server.stop()
    }
}
