package com.lupyd.app

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name="TestPlugin")
class TestPlugin: Plugin() {

    @PluginMethod
    fun test(call: PluginCall) {
        val text = randomString(100)
        call.resolve(JSObject().put("text", text))
    }

}