package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ChatMessage
import com.example.data.model.Language
import com.example.ui.theme.*
import com.example.ui.viewmodel.SafeBanglaViewModel
import kotlinx.coroutines.launch

@Composable
fun AiAssistantScreen(
    viewModel: SafeBanglaViewModel,
    modifier: Modifier = Modifier
) {
    val language by viewModel.language.collectAsState()
    val chatMessages by viewModel.chatMessages.collectAsState()
    var inputQuery by remember { mutableStateOf("") }
    val coroutineScope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    val quickChips = remember(language) {
        if (language == Language.BANGLA) {
            listOf(
                "সাপের কামড়ে কী করবেন?",
                "ঘূর্ণিঝড় সংকেত ১০ মানে কী?",
                "বন্যার পানি কীভাবে ফুটাবেন?",
                "নিকটস্থ নিরাপদ আশ্রয়কেন্দ্র",
                "ভূমিকম্পের জরুরি নিরাপত্তা"
            )
        } else {
            listOf(
                "Snakebite first aid protocol",
                "Cyclone Great Danger Signal 10",
                "Flood drinking water purification",
                "Find nearest available shelter",
                "Earthquake safety drill"
            )
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(SlateDark)
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(12.dp))

        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(SafetyTeal.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = SafetyCyan, modifier = Modifier.size(20.dp))
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = if (language == Language.BANGLA) "এআই ক্রাইসিস অ্যাসিস্ট্যান্ট" else "AI Crisis Safety Assistant",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = if (language == Language.BANGLA) "দুর্যোগ ও প্রাথমিক চিকিৎসা বিষয়ক পরামর্শ" else "Bangladesh Disaster Response NLP Engine",
                        color = SlateMuted,
                        fontSize = 11.sp
                    )
                }
            }

            Surface(
                color = SlateCardElevated,
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = if (language == Language.BANGLA) "বাংলা" else "ENGLISH",
                    color = SafetyCyan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Suggestion Chips Row
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(quickChips) { chipText ->
                Surface(
                    color = SlateCardElevated,
                    shape = RoundedCornerShape(16.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SlateBorder),
                    modifier = Modifier.clickable {
                        viewModel.sendChatMessage(chipText)
                        coroutineScope.launch {
                            listState.animateScrollToItem(chatMessages.size)
                        }
                    }
                ) {
                    Text(
                        text = chipText,
                        color = SlateLight,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Chat Messages List
        LazyColumn(
            state = listState,
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            contentPadding = PaddingValues(vertical = 8.dp)
        ) {
            items(chatMessages, key = { it.id }) { msg ->
                ChatMessageBubble(message = msg, language = language)
            }
        }

        // Input Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = inputQuery,
                onValueChange = { inputQuery = it },
                placeholder = {
                    Text(
                        text = if (language == Language.BANGLA) "জরুরি সাহায্য বা প্রশ্ন লিখুন..." else "Ask crisis guidance or emergency procedure...",
                        color = SlateMuted,
                        fontSize = 12.sp
                    )
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = SlateSurface,
                    unfocusedContainerColor = SlateSurface,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = SafetyCyan,
                    unfocusedBorderColor = SlateBorder
                ),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier
                    .weight(1f)
                    .testTag("chat_input_field")
            )

            Spacer(modifier = Modifier.width(8.dp))

            IconButton(
                onClick = {
                    if (inputQuery.isNotBlank()) {
                        viewModel.sendChatMessage(inputQuery)
                        inputQuery = ""
                        coroutineScope.launch {
                            listState.animateScrollToItem(chatMessages.size)
                        }
                    }
                },
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(EmergencyRed)
                    .testTag("send_chat_button")
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send", tint = Color.White, modifier = Modifier.size(20.dp))
            }
        }
    }
}

@Composable
private fun ChatMessageBubble(
    message: ChatMessage,
    language: Language
) {
    val isUser = message.isUser
    val alignment = if (isUser) Alignment.End else Alignment.Start
    val bgColor = if (isUser) SafetyTeal else SlateSurface
    val textColor = Color.White
    val textToDisplay = if (language == Language.BANGLA) message.textBangla else message.textEnglish

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = alignment
    ) {
        Surface(
            color = bgColor,
            shape = RoundedCornerShape(
                topStart = 16.dp,
                topEnd = 16.dp,
                bottomStart = if (isUser) 16.dp else 4.dp,
                bottomEnd = if (isUser) 4.dp else 16.dp
            ),
            border = if (!isUser) androidx.compose.foundation.BorderStroke(1.dp, SlateBorder) else null,
            modifier = Modifier.widthIn(max = 320.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                if (!isUser) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(bottom = 4.dp)
                    ) {
                        Icon(Icons.Default.SmartToy, contentDescription = null, tint = SafetyCyan, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("SafeBangla AI Safety Guide", color = SafetyCyan, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
                Text(
                    text = textToDisplay,
                    color = textColor,
                    fontSize = 12.sp,
                    lineHeight = 17.sp
                )
            }
        }
    }
}
