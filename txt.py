import json
import os
import re

input_dir = '/Users/julianp/Dropbox/Code/gpt-crawler/input'
output_dir = '/Users/julianp/Dropbox/Code/gpt-crawler/output'
intro_text_to_remove = [
    "Skip to main content\n\tWe use optional cookies to improve your experience on our websites, such as through social media connections, and to display personalized advertising based on your online activity. If you reject optional cookies, only cookies necessary to provide you the services will be used. You may change your selection by clicking “Manage Cookies” at the bottom of the page. Privacy Statement Third-Party Cookies\nAccept Reject Manage cookies\nLearn\nDocumentation\nTraining\nCredentials\nQ&A\nCode Samples\nAssessments\nShows\nSign in\nTraining\nProducts\nCareer Paths\nBrowse all training\nEducator Center\nStudent Hub\nFAQ & Help\nAdd\n",
    "Skip to main content\n\tWe use optional cookies to improve your experience on our websites, such as through social media connections, and to display personalized advertising based on your online activity. If you reject optional cookies, only cookies necessary to provide you the services will be used. You may change your selection by clicking “Manage Cookies” at the bottom of the page. Privacy Statement Third-Party Cookies\nAccept Reject Manage cookies\n"
]
standard_menu_text = "Learn\nDocumentation\nTraining\nCredentials\nQ&A\nCode Samples\nAssessments\nShows\nSign in\nTraining\nProducts\nCareer Paths\nBrowse all training\nEducator Center\nStudent Hub\nFAQ & Help"
conclusion_pattern = r"English \(United States\)\n.*?© Microsoft \d{4}"
help_feedback_pattern = r"Need help\? See our troubleshooting guide or provide specific feedback by reporting an issue\.\n\nFeedback\n\nWas this page helpful\?\n\nYes\nNo"

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

# Process each JSON file
for filename in os.listdir(input_dir):
    if filename.endswith('.json'):
        input_path = os.path.join(input_dir, filename)
        output_path = os.path.join(output_dir, filename.replace('.json', '.txt'))

        with open(input_path, 'r') as file:
            data = json.load(file)
        
        with open(output_path, 'w') as file:
            for entry in data:
                title = entry.get('title', '')
                url = entry.get('url', '')
                html = entry.get('html', '')

                # Remove all intro texts
                for intro_text in intro_text_to_remove:
                    html = html.replace(intro_text, '')

                # Remove standard menu text
                html = html.replace(standard_menu_text, '')

                # Remove conclusion and feedback sections
                html = re.sub(conclusion_pattern, '', html, flags=re.DOTALL)
                html = re.sub(help_feedback_pattern, '', html, flags=re.DOTALL)
                html = html.replace('\\n', '\n')

                file.write(title + '\n')
                file.write(url + '\n')
                file.write(html + '\n\n')

print("Processing complete.")
