FROM nginx
ADD nginx.conf /etc/nginx/conf.d/default.conf
RUN rm /usr/share/nginx/html/*
ADD js/ /usr/share/nginx/html/js/
ADD dist /usr/share/nginx/html
CMD nginx -g "daemon off;"

