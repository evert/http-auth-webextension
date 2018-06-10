.PHONY: build
build: http-auth-enhancer.zip

http-auth-enhancer.zip: *.js manifest.json popup.html popup.js README.md css/*.css icons/*.svg
	rm http-auth-enhancer.zip
	zip -r http-auth-enhancer.zip *.js manifest.json popup.html popup.js README.md css/*.css icons/*.svg 
