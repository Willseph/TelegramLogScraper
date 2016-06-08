/* * *
* Telegram Log Scraper
* Written by William Thomas (http://willseph.com)
* Licenced under the GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007:
* 
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
* 
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
* 
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
* * */

// Consts
var SELECTOR_HEADER = '.tg_head_main_peer_wrap';
var SELECTOR_HEADER_MEDIA_DROPDOWN = '.tg_head_peer_media_dropdown';
var SELECTOR_MESSAGE_CONTAINER = '.im_history_scrollable_wrap';
var SELECTOR_MESSAGE = (SELECTOR_MESSAGE_CONTAINER+' .im_history_message_wrap');

var INTERVAL_TIME_MS = 1000;
var FIRST_MESSAGE_CHECKS = 20;

// Local vars
var foundHeader = false;
var scrapeInProgress = false;
var remainingMessageChecks = FIRST_MESSAGE_CHECKS;
var lastTopMessageTime = '';

function L(s) {
	console.log('[Telegram Log Scraper] '+s);
}

function telegramlogscraper_Main() {
	L('Extension loaded. Beginning search for header element.');
	telegramlogscraper_SearchAgainForHeader();
}

function telegramlogscraper_SearchAgainForHeader() {
	if(foundHeader)
		return;

	var $header = jQuery(SELECTOR_HEADER);
	if($header.length < 1) {
		setTimeout(telegramlogscraper_SearchAgainForHeader, INTERVAL_TIME_MS);
		return;
	}
	else {
		foundHeader = true;
		telegramlogscraper_FoundHeader($header.first());
	}
}

function telegramlogscraper_FoundHeader($header) {
	L('Found header, injecting button.');

	var $scrapeButton = jQuery('<a class="tg_head_btn tg_head_msgs_edit_btn">Scrape logs</a>');
	$scrapeButton.click(telegramlogscraper_ScrapeButtonClicked);

	$header.find(SELECTOR_HEADER_MEDIA_DROPDOWN).after($scrapeButton);
}

function telegramlogscraper_ScrapeButtonClicked() {
	if(scrapeInProgress)
		return;
	L('Scrape button clicked.');

	var confirmed = confirm('Do you wish to scrape all logs from this chat? The process could take a while depending on the length of the history.\n\nWhile the scrape works, this app will become unusable. You may open a separate tab to continue chatting with others.\n\nYou may need to keep this tab active and visible in order to avoid the Javascript engine from sleeping during the scrape.\n\nBegin the log scrape process?');
	if(confirmed) 
		telegramlogscraper_BeginScrape();
}

function telegramlogscraper_BeginScrape() {
	scrapeInProgress = true;
	jQuery('body').append(telegramlogscraper_CreateShadeElement());
	telegramlogscraper_BeginScrollTop();
}

function telegramlogscraper_CreateShadeElement() {
	var html = '<div class="telegramlogscraper_shade"><div class="telegramlogscraper_shade_content"><div class="telegramlogscraper_shade_text">Loading entire chat history. This may take a while.</div><div class="cssload-container"><div class="cssload-speeding-wheel"></div></div></div></div>';
	return jQuery(html);
}

function telegramlogscraper_BeginScrollTop() {
	telegramlogscraper_ScrollTop();
}

function telegramlogscraper_ScrollTop() {
	L('Scrolling to top.');
	jQuery(SELECTOR_MESSAGE_CONTAINER).scrollTop(0);
	setTimeout(telegramlogscraper_CheckTopMessage, INTERVAL_TIME_MS);
}

function telegramlogscraper_CheckTopMessage() {
	if(remainingMessageChecks < 0) {
		telegramlogscraper_ReachedTop();
		return;
	}

	var $topMessage = jQuery(SELECTOR_MESSAGE).first();
	if(!$topMessage || $topMessage.length < 1) {
		telegramlogscraper_ScrollTop();
		return;
	}

	var topMessageTime = $topMessage.find('.im_message_date').attr('data-content');

	if(lastTopMessageTime == topMessageTime)
		remainingMessageChecks--;
	else 
		remainingMessageChecks = FIRST_MESSAGE_CHECKS;

	lastTopMessageTime = topMessageTime;
	telegramlogscraper_ScrollTop();
}

function telegramlogscraper_ReachedTop() {
	L('Top message found.');
	var html = jQuery(SELECTOR_MESSAGE_CONTAINER).html();
	jQuery('.page_wrap').first().html(html);
	jQuery('.telegramlogscraper_shade').remove();
	jQuery('body').css('overflow','scroll');

	window.print();
}

jQuery(document).ready(telegramlogscraper_Main);
